---
title: Vehicle Telemetry and Data Collection Infrastructure
summary: End-to-end data acquisition for a solar race vehicle, covering a CAN-to-SD
  logger, a 6-axis inertial measurement unit driver, radio frequency transmission,
  and automated CAN tooling across a 7-node network.
team: Midnight Sun Solar Car
repo: https://github.com/Akashem06/midnight-sun
stack:
- C
- Python
- STM32
- CAN
- SPI
- FATfs
- Jinja2
- YAML
- DBC
- XBee
features:
- Designed an end-to-end vehicle data acquisition system with visualization for suspension
- motor
- and battery data.
- Built an SPI-based SD card logger using FATfs
- sustaining 1 MB/s write speeds for continuous diagnostics capture.
- Developed a 6-axis inertial measurement unit driver and integrated it into the telemetry
  pipeline at 100 Hz sampling for suspension modelling.
- Automated CAN tooling using Jinja2 templates and YAML configuration files
- generating DBC files
- firmware message definitions
- runtime analysis tools
- and simulation harnesses for a 7-node network.
- Stress-tested the full telemetry system across 50+ km of on-track driving to verify
  robustness under dynamic loads and electromagnetic noise.
challenges: The main challenge was keeping the logger from dropping frames under peak
  CAN bus load. FATfs write latency varies with cluster boundaries and card speed,
  so the firmware uses a double-buffer scheme to decouple the CAN receive interrupt
  from the SD write path. The Jinja2 code generation step was added after the manual
  DBC and firmware message definition process became a bottleneck for adding new signals,
  and it eliminated most of the consistency bugs that came from keeping those files
  in sync by hand.
image: /assets/images/projects/vehicle-telemetry-and-data-collection-infrastructure/cover.jpg
featured: false
date: '2025-05-01'
---

A data acquisition and telemetry system for the Midnight Sun solar car, built to log and transmit vehicle data during testing and competition.

Every node on the CAN network publishes signals according to a YAML-defined schema. Jinja2 templates generate the DBC file, the firmware message packing and unpacking code, and the off-car analysis tools from that single source of truth, so adding a new signal is a one-line YAML change.

On the vehicle, a dedicated telemetry node runs two FreeRTOS tasks: one to receive and buffer CAN frames, and one to write them to an SD card over SPI using FATfs. A 6-axis inertial measurement unit on the same board samples at 100 Hz and feeds into the suspension modelling pipeline.

For radio telemetry, the node transmits selected signals over XBee to a laptop off-car, where a Python process decodes the frames and updates a Grafana dashboard in real time.

The system was validated across 50+ km of on-track driving at competition, with no dropped sessions or data corruption.
