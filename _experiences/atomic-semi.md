---
company: Fab2
title: Embedded Software Intern
company_url: https://fab2.com/
logo: /assets/images/experiences/fab2.jpg
location: San Francisco, CA
type: Co-op
start_date: Jan 2026
end_date: May 2026
stack:
- Rust
- STM32
- FDCAN
- USB
- ActixWeb
- PostgreSQL
- Power Electronics
- Control Systems
highlights:
- Delivered firmware for 8 ozone generators
- covering maximum power point tracking
- AC output sensing
- chamber priming
- and health monitoring.
- Built a self-resonant Class-E plasma generator with radio frequency tracking
- DC/DC control
- and 300W power regulation.
- Designed an 8-harmonic discrete Fourier transform autofocus loop with least mean
  squares feedforward at 70 kHz
- plus R-axis gearing control
- all in Rust.
- Brought up a 16-channel heater board with PID control
- pulse sequencing
- and resistive load calibration across 10 tools.
- Implemented a 10-sensor Pirani gauge calibration system in Rust with an ActixWeb
  and PostgreSQL backend
- driving turbopump
- butterfly valve
- and mass flow controller dosing.
- Authored capacitive distance gauge firmware with 5 kHz sub-micron data capture and
  2-channel drift compensation.
- Designed an STM32H7 dual-bank bootloader with RAM execution
- crash-safe self-update
- and transport over FDCAN and USB.
- Built 5+ reusable Rust libraries including an oscilloscope with edge triggering
- a Pirani debug panel
- a settling detector
- and a CSV logger.
gallery:
- image: /assets/images/experiences/fab2/atomicsemi.jpg
  thumb: /assets/images/experiences/fab2/thumb/atomicsemi.jpg
  alt: Atomic Semi
- image: /assets/images/experiences/fab2/welcometosf.jpg
  thumb: /assets/images/experiences/fab2/thumb/welcometosf.jpg
  alt: Welcome To SF
date: '2026-05-31'
featured: false
---

Semiconductor fabrication tooling firmware at Atomic Semi. The work spanned a wide range of subsystems across the fab stack, from plasma generation and vacuum control to heater sequencing and precision distance sensing. Most firmware was written in Rust or in C, with a mix of real-time control loops and backend tooling for calibration and diagnostics.
