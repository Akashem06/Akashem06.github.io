#!/usr/bin/env ruby
# frozen_string_literal: true

# Build-time fetch of PUBLIC Substack posts → _data/substack.json, read by
# blog.html (the Substack-first hub: subscribe card + latest posts).
#
# WHY build-time (not client-side): ships static JSON (instant, cached, no client
# round-trip to Substack), and mirrors the GitHub-panel pattern already in this repo
# (script/fetch_github.rb). Substack exposes a public RSS feed at
# https://<handle>.substack.com/feed — no auth, no secret needed.
#
# Handle: ENV["SUBSTACK_HANDLE"] first (nice for local runs), else the `substack:`
# value in _config.yml.
# NON-FATAL by design: any failure (no handle, empty feed, network) prints a warning
# and exits 0 so a transient hiccup never blocks a deploy — the blog simply renders
# its subscribe CTA / empty state (blog.html gates on site.data.substack.posts).

require "net/http"
require "json"
require "uri"
require "time"
require "yaml"
require "cgi"
require "rexml/document"

OUT = File.expand_path("../_data/substack.json", __dir__)

def warn_skip(msg)
  warn "[fetch_substack] SKIP: #{msg} — /blog/ will render the subscribe CTA / empty state this build."
  exit 0
end

# Resolve the handle: env wins, else _config.yml → substack.
handle = ENV["SUBSTACK_HANDLE"]
if handle.nil? || handle.empty?
  begin
    cfg = YAML.load_file(File.expand_path("../_config.yml", __dir__)) || {}
    handle = cfg["substack"]
  rescue StandardError => e
    warn_skip("could not read _config.yml (#{e.class}: #{e.message})")
  end
end
warn_skip("no Substack handle (set `substack:` in _config.yml or SUBSTACK_HANDLE)") if handle.nil? || handle.to_s.strip.empty?
handle = handle.to_s.strip

MAX_POSTS = 12

# Strip HTML tags, decode entities, collapse whitespace, then truncate cleanly.
def excerpt(html, limit = 180)
  return nil if html.nil?
  text = CGI.unescapeHTML(html.gsub(/<[^>]+>/, " ")).gsub(/\s+/, " ").strip
  return nil if text.empty?
  return text if text.length <= limit
  text[0, limit].sub(/\s+\S*$/, "") + "…"
end

# First <img src="..."> found in an HTML blob (fallback for a post's cover image).
def first_img(html)
  return nil if html.nil?
  m = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  m && m[1]
end

# Substack sits behind Cloudflare, which 403s datacenter IPs outright (GitHub
# Actions runners) regardless of User-Agent. So we try the feed directly first
# (works locally / anywhere not blocked), then fall back to a public read-proxy
# that fetches it from an allowed IP and echoes the raw body. A browser UA +
# browser Accept headers + a few retries ride out the rest.
BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " \
             "(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"

FEED_PATH = "https://#{handle}.substack.com/feed"

# Sources tried in order. Each entry is [label, url]; the first that returns a
# body containing an <item> wins. The proxy bypasses Cloudflare's IP block.
SOURCES = [
  ["direct",     FEED_PATH],
  ["allorigins", "https://api.allorigins.win/raw?url=#{CGI.escape(FEED_PATH)}"]
].freeze

def http_get(url)
  uri = URI(url)
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = (uri.scheme == "https")
  http.open_timeout = 15
  http.read_timeout = 30
  req = Net::HTTP::Get.new(uri)
  req["User-Agent"] = BROWSER_UA
  req["Accept"] = "application/rss+xml, application/xml, text/xml, */*;q=0.1"
  req["Accept-Language"] = "en-US,en;q=0.9"
  http.request(req)
end

# Try one source up to 3 times; return its body on success, else nil.
def try_source(label, url)
  attempts = 0
  begin
    attempts += 1
    res = http_get(url)
    raise "HTTP #{res.code}" unless res.is_a?(Net::HTTPSuccess)
    raise "no <item> in body" unless res.body&.include?("<item")
    warn "[fetch_substack] fetched via #{label} (attempt #{attempts})."
    res.body
  rescue StandardError => e
    if attempts < 3
      sleep(attempts * 2)
      retry
    end
    warn "[fetch_substack] #{label} failed: #{e.message} (#{url})."
    nil
  end
end

begin
  body = nil
  SOURCES.each do |label, url|
    body = try_source(label, url)
    break if body
  end
  warn_skip("all sources failed (direct + proxy) for #{FEED_PATH}") if body.nil?

  doc = REXML::Document.new(body)
  items = REXML::XPath.match(doc, "//item")
  warn_skip("feed has no <item>s yet (nothing published?)") if items.empty?

  posts = items.first(MAX_POSTS).map do |item|
    title   = item.elements["title"]&.text
    link    = item.elements["link"]&.text
    pubdate = item.elements["pubDate"]&.text
    content = item.elements["content:encoded"]&.text
    desc    = item.elements["description"]&.text
    enclosure = item.elements["enclosure"]&.attributes&.[]("url")

    date_iso =
      begin
        Time.parse(pubdate).utc.strftime("%Y-%m-%d") if pubdate
      rescue StandardError
        nil
      end

    {
      "title"   => title&.strip,
      "url"     => link&.strip,
      "date"    => date_iso,
      "excerpt" => excerpt(desc || content),
      "image"   => enclosure || first_img(content) || first_img(desc)
    }
  end.select { |p| p["title"] && p["url"] }

  warn_skip("no usable items parsed from feed") if posts.empty?

  out = {
    "generated_at" => Time.now.utc.iso8601,
    "handle"       => handle,
    "url"          => "https://#{handle}.substack.com",
    "posts"        => posts
  }

  File.write(OUT, JSON.pretty_generate(out) + "\n")
  puts "[fetch_substack] wrote #{OUT} — #{posts.size} post(s) from #{handle}.substack.com."
rescue StandardError => e
  warn_skip("#{e.class}: #{e.message}")
end
