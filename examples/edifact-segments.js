#!/usr/bin/env node
const message = process.argv[2] || "UNA:+.? 'UNB+UNOC:3+SYNTHETIC-SENDER+SYNTHETIC-RECEIVER+240101:1200+1'BGM+Z01+SYNTHETIC-CASE-1'UNT+3+1'";
const segments = message
  .split("'")
  .map((segment) => segment.trim())
  .filter(Boolean)
  .map((raw, index) => ({ index, tag: raw.slice(0, 3), raw }));
console.log(JSON.stringify({ segment_count: segments.length, segments }, null, 2));
