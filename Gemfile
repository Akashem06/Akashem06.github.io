source "https://rubygems.org"

# Jekyll - static site generator (GitHub Pages compatible).
gem "jekyll", "~> 4.3"

# Ruby 3.0+ no longer bundles webrick, which `jekyll serve` needs.
gem "webrick", "~> 1.8"

# Windows and JRuby ship no system zoneinfo database, so Jekyll's timezone
# handling needs tzinfo + a bundled copy of the data. Platform-gated so it's
# a no-op on the Linux GitHub Pages builder.
platforms :windows, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# Auto-generated sitemap.xml and RSS feed.
group :jekyll_plugins do
  gem "jekyll-sitemap", "~> 1.4"
  gem "jekyll-feed", "~> 0.17"
end

# Read image dimensions at build time (header bytes only — no ImageMagick),
# used by _plugins/image_dims.rb to stamp width/height + responsive srcset.
# Safe on the Actions builder: CI runs `bundle exec jekyll build`, not Pages'
# restricted plugin whitelist, so custom _plugins/ + gems load normally.
gem "fastimage", "~> 2.3"

# CI validation (see docs/05-cicd.md).
group :test do
  gem "html-proofer", "~> 5.0"
end
