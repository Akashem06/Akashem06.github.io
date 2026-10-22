# frozen_string_literal: true

# Build-time image helper. The `image_dims` Liquid filter resolves a site-relative
# path (e.g. "/assets/images/gallery/barcelona/barcelona-1.webp") against the source
# tree and reads the file's real pixel size with FastImage (header bytes only — fast
# for thousands of files, no ImageMagick needed), returning
# `width="700" height="467"` so the browser reserves space (kills layout shift) and
# `loading="lazy"` can reliably tell what's off-screen.
#
# Fail-soft: a missing/unreadable file yields "" and never breaks the build. Results
# are memoised per path for the life of the build process.

require "fastimage"

module Jekyll
  module ImageHelpers
    @cache = {}

    # [width, height] for a site-relative web path, or nil. Memoised.
    def self.dims(context, web_path)
      key = normalize(web_path)
      return nil unless key
      return @cache[key] if @cache.key?(key)

      site = context.registers[:site]
      base = site.config["baseurl"].to_s
      rel = key.dup
      rel = rel[base.length..-1] if !base.empty? && rel.start_with?(base)
      rel = rel.sub(%r{\A/}, "")
      abs = File.join(site.source, rel)

      size = (FastImage.size(abs) if File.file?(abs))
      @cache[key] = (size && size.length == 2 ? size : nil)
    rescue StandardError
      @cache[key] = nil
    end

    # Trim query/hash and reject blanks.
    def self.normalize(web_path)
      return nil if web_path.nil?
      p = web_path.to_s.strip.split(/[?#]/).first
      p && !p.empty? ? p : nil
    end
  end

  module ImageFilters
    # => `width="W" height="H"` (or "" when the file can't be read).
    def image_dims(web_path)
      d = Jekyll::ImageHelpers.dims(@context, web_path)
      d ? %(width="#{d[0]}" height="#{d[1]}") : ""
    end
  end
end

Liquid::Template.register_filter(Jekyll::ImageFilters)
