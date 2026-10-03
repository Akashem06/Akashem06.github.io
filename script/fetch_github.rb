#!/usr/bin/env ruby
# frozen_string_literal: true

# Build-time fetch of PUBLIC GitHub data → _data/github.json, read by
# _includes/github-panel.html (contribution heatmap + pinned repos on /projects/).
#
# WHY build-time (not client-side): keeps the token server-side (Actions), ships
# static JSON (instant, cached, no client rate limits), and — because the GraphQL
# query only requests public fields — no private repo/commit data can ever appear.
#
# Auth: prefers GH_PAT (a classic PAT with `read:user`/`public_repo`, if you want
# to run locally or need the contribution calendar), else the Actions GITHUB_TOKEN.
# NON-FATAL by design: any failure (no token, rate limit, network) prints a warning
# and exits 0 so a transient GitHub hiccup never blocks a deploy — the panel simply
# doesn't render that build (the include gates on site.data.github).

require "net/http"
require "json"
require "uri"
require "time"

LOGIN = ENV.fetch("GH_LOGIN", "Akashem06")
TOKEN = ENV["GH_PAT"] || ENV["GITHUB_TOKEN"] || ENV["GH_TOKEN"]
OUT   = File.expand_path("../_data/github.json", __dir__)

def warn_skip(msg)
  warn "[fetch_github] SKIP: #{msg} — /projects/ GitHub panel will not render this build."
  exit 0
end

warn_skip("no token (set GH_PAT locally, or run in Actions with GITHUB_TOKEN)") if TOKEN.nil? || TOKEN.empty?

QUERY = <<~GRAPHQL
  query($login:String!){
    user(login:$login){
      contributionsCollection{
        contributionCalendar{
          totalContributions
          weeks{ contributionDays{ contributionCount date contributionLevel } }
        }
      }
      pinnedItems(first:6, types:REPOSITORY){
        nodes{ ... on Repository{
          name description url stargazerCount forkCount
          primaryLanguage{ name color }
        }}
      }
    }
  }
GRAPHQL

LEVELS = { "NONE" => 0, "FIRST_QUARTILE" => 1, "SECOND_QUARTILE" => 2,
           "THIRD_QUARTILE" => 3, "FOURTH_QUARTILE" => 4 }.freeze

begin
  uri = URI("https://api.github.com/graphql")
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  http.read_timeout = 20
  req = Net::HTTP::Post.new(uri)
  req["Authorization"] = "bearer #{TOKEN}"
  req["User-Agent"] = "akashem06.github.io-build"
  req.body = JSON.dump(query: QUERY, variables: { login: LOGIN })

  res = http.request(req)
  warn_skip("HTTP #{res.code}") unless res.is_a?(Net::HTTPSuccess)

  body = JSON.parse(res.body)
  warn_skip("GraphQL errors: #{body["errors"].map { |e| e["message"] }.join("; ")}") if body["errors"]

  user = body.dig("data", "user")
  warn_skip("no data for user #{LOGIN}") if user.nil?

  cal = user.dig("contributionsCollection", "contributionCalendar")
  weeks = (cal["weeks"] || []).map do |w|
    { "days" => w["contributionDays"].map do |d|
      { "count" => d["contributionCount"],
        "level" => LEVELS.fetch(d["contributionLevel"], 0),
        "date"  => d["date"] }
    end }
  end

  pinned = (user.dig("pinnedItems", "nodes") || []).map do |n|
    { "name"  => n["name"],
      "desc"  => n["description"],
      "url"   => n["url"],
      "stars" => n["stargazerCount"],
      "forks" => n["forkCount"],
      "lang"  => n.dig("primaryLanguage", "name"),
      "color" => n.dig("primaryLanguage", "color") }
  end

  out = {
    "generated_at"        => Time.now.utc.iso8601,
    "login"               => LOGIN,
    "profile_url"         => "https://github.com/#{LOGIN}",
    "total_contributions" => cal["totalContributions"],
    "weeks"               => weeks,
    "pinned"              => pinned
  }

  File.write(OUT, JSON.pretty_generate(out) + "\n")
  puts "[fetch_github] wrote #{OUT} — #{pinned.size} pinned, " \
       "#{out["total_contributions"]} contributions, #{weeks.size} weeks."
rescue StandardError => e
  warn_skip("#{e.class}: #{e.message}")
end
