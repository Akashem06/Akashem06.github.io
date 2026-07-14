#!/usr/bin/env ruby
# frozen_string_literal: true

# Required-frontmatter checker (docs/05-cicd.md).
#   posts       -> title, date, description, categories
#   galleries   -> bucket, album, image, alt (alt non-empty)
#   projects    -> title, summary, at least one of repo/demo, and `alt` on every
#                  gallery image
#   experiences -> company, title, logo
# Exits non-zero listing every offending file. No gems - stdlib YAML only.

require "yaml"
require "date" # YAML frontmatter dates parse to Date/Time (permitted_classes below)

ROOT = File.expand_path("..", __dir__)
errors = []

# Returns the parsed YAML frontmatter hash, or nil if the file has no frontmatter.
def frontmatter(path)
  raw = File.read(path)
  return nil unless raw.start_with?("---")

  # Split on the closing '---' delimiter of the frontmatter block.
  parts = raw.split(/^---\s*$/, 3)
  return nil if parts.length < 3

  YAML.safe_load(parts[1], permitted_classes: [Date, Time], aliases: true) || {}
rescue Psych::SyntaxError => e
  # Surface malformed YAML as an error rather than crashing the run.
  { "__parse_error__" => e.message }
end

def present?(value)
  return false if value.nil?
  return !value.strip.empty? if value.is_a?(String)
  return !value.empty? if value.respond_to?(:empty?)

  true
end

def glob(dir)
  Dir.glob(File.join(ROOT, dir, "*.{md,markdown,html}"))
end

# --- Posts -----------------------------------------------------------------
glob("_posts").each do |path|
  fm = frontmatter(path)
  rel = path.sub("#{ROOT}/", "")
  if fm.nil?
    errors << "#{rel}: missing frontmatter"
    next
  end
  if fm["__parse_error__"]
    errors << "#{rel}: invalid YAML - #{fm['__parse_error__']}"
    next
  end
  %w[title date description categories].each do |key|
    errors << "#{rel}: missing required `#{key}`" unless present?(fm[key])
  end
end

# --- Galleries -------------------------------------------------------------
glob("_galleries").each do |path|
  fm = frontmatter(path)
  rel = path.sub("#{ROOT}/", "")
  if fm.nil?
    errors << "#{rel}: missing frontmatter"
    next
  end
  if fm["__parse_error__"]
    errors << "#{rel}: invalid YAML - #{fm['__parse_error__']}"
    next
  end
  %w[bucket album image alt].each do |key|
    errors << "#{rel}: missing required `#{key}`" unless present?(fm[key])
  end
end

# --- Projects --------------------------------------------------------------
glob("_projects").each do |path|
  fm = frontmatter(path)
  rel = path.sub("#{ROOT}/", "")
  if fm.nil?
    errors << "#{rel}: missing frontmatter"
    next
  end
  if fm["__parse_error__"]
    errors << "#{rel}: invalid YAML - #{fm['__parse_error__']}"
    next
  end
  %w[title summary].each do |key|
    errors << "#{rel}: missing required `#{key}`" unless present?(fm[key])
  end
  unless present?(fm["repo"]) || present?(fm["demo"])
    errors << "#{rel}: needs at least one of `repo` or `demo`"
  end
  # Every gallery image needs alt text (accessibility - same rule as galleries).
  if fm["gallery"].is_a?(Array)
    fm["gallery"].each_with_index do |shot, i|
      unless shot.is_a?(Hash) && present?(shot["alt"])
        errors << "#{rel}: gallery[#{i}] missing `alt`"
      end
    end
  end
end

# --- Experiences -----------------------------------------------------------
glob("_experiences").each do |path|
  fm = frontmatter(path)
  rel = path.sub("#{ROOT}/", "")
  if fm.nil?
    errors << "#{rel}: missing frontmatter"
    next
  end
  if fm["__parse_error__"]
    errors << "#{rel}: invalid YAML - #{fm['__parse_error__']}"
    next
  end
  %w[company title logo].each do |key|
    errors << "#{rel}: missing required `#{key}`" unless present?(fm[key])
  end
end

if errors.empty?
  puts "Frontmatter check passed."
  exit 0
else
  warn "Frontmatter check FAILED:"
  errors.each { |e| warn "  - #{e}" }
  exit 1
end
