# frozen_string_literal: true

# Build-time image helpers. Two Liquid filters, both resolve a site-relative
# path (e.g. "/assets/images/gallery/barcelona/thumb/barcelona-1.webp") against
# the source tree and read the file's real pixel size with FastImage (header
# bytes only — fast for thousands of files, no ImageMagick needed).
#
#   image_dims  → `width="500" height="333"` so the browser reserves space
#                 (kills layout shift) and `loading="lazy"` can reliably tell
#                 what's off-screen. Empty string if the file is missing.
#
#   srcset_with → an existence-gated responsive srcset. Given a base image and a
#                 filename suffix (e.g. "@300"), it emits
#                 `/…@300.webp 300w, /…webp 500w` ONLY when the smaller variant
#                 actually exists on disk, using each file's real width as the
#                 descriptor. Returns "" otherwise, so templates degrade to a
#                 plain `src` until the image pipeline has produced the variants
#                 — shipping this before a re-generate never 404s a srcset.
#
# Fail-soft everywhere: a missing/unreadable file yields "" and never breaks the
# build. Results are memoised per path for the life of the build process.

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

    # Prefix a root-absolute asset path with the configured baseurl (mirrors the
    # `relative_url` filter) so srcset URLs resolve under a project subpath too.
    def self.with_baseurl(context, web_path)
      base = context.registers[:site].config["baseurl"].to_s
      return web_path if base.empty? || web_path.start_with?(base)
      base + web_path
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

    # => `<variant> <Vw>, <base> <Bw>` when a `<suffix>` sibling exists, else "".
    # e.g. {{ item.thumb | srcset_with: "@300" }}
    def srcset_with(base_path, suffix)
      base = Jekyll::ImageHelpers.normalize(base_path)
      return "" unless base && suffix

      variant = base.sub(/(\.[^.\/]+)\z/, "#{suffix}\\1")
      return "" if variant == base

      vd = Jekyll::ImageHelpers.dims(@context, variant)
      bd = Jekyll::ImageHelpers.dims(@context, base)
      return "" unless vd && bd

      v_url = Jekyll::ImageHelpers.with_baseurl(@context, variant)
      b_url = Jekyll::ImageHelpers.with_baseurl(@context, base)
      "#{v_url} #{vd[0]}w, #{b_url} #{bd[0]}w"
    end
  end
end

Liquid::Template.register_filter(Jekyll::ImageFilters)
