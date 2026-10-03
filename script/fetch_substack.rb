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

begin
  uri = URI("https://#{handle}.substack.com/feed")
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  http.read_timeout = 20
  req = Net::HTTP::Get.new(uri)
  req["User-Agent"] = "akashem06.github.io-build"

  res = http.request(req)
  warn_skip("HTTP #{res.code} from #{uri}") unless res.is_a?(Net::HTTPSuccess)

  doc = REXML::Document.new(res.body)
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
