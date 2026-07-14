---
title: Solar Car Electrical and Software Integration
summary: End-to-end firmware for a 5-node distributed system managing battery protection,
  power distribution, and telemetry on a competition solar electric vehicle.
team: Midnight Sun Solar Car
repo: https://github.com/Akashem06/midnight-sun
stack:
- C
- FreeRTOS
- CAN
- STM32
- SPI
- I2C
- Python
- MATLAB
features:
- Designed firmware for a 5-node distributed system covering battery management
- power distribution
- and telemetry.
- Secured top 10 finishes at 2 annual competitions as the first Canadian single-occupant
  vehicle team to pass scrutineering
- with 0 electrical failures over 54 laps on a 3.15 mile track.
- Built a hardware-in-the-loop vehicle mockup
- cutting prototype validation time by 80%.
challenges: The hardest part of running a distributed system on a race vehicle is
  reliability under noise and vibration. Every node communicates over CAN, so any
  protocol inconsistency or missed message has cascading effects. Solving that required
  careful scheduling, hardware-in-the-loop testing before any firmware went near the
  car, and a software mockup that let us stress-test the full system topology on a
  bench.
image: /assets/images/projects/solar-car-electrical-and-software-integration/cover.jpg
gallery:
- image: /assets/images/projects/solar-car-electrical-and-software-integration/ms16.jpg
  thumb: /assets/images/projects/solar-car-electrical-and-software-integration/thumb/ms16.jpg
  alt: MS16
- image: /assets/images/projects/solar-car-electrical-and-software-integration/solarcar3.jpg
  thumb: /assets/images/projects/solar-car-electrical-and-software-integration/thumb/solarcar3.jpg
  alt: MS15
- image: /assets/images/projects/solar-car-electrical-and-software-integration/solarcar.jpg
  thumb: /assets/images/projects/solar-car-electrical-and-software-integration/thumb/solarcar.jpg
  alt: MS15
featured: true
date: '2026-06-01'
---

The solar car is a fully custom solar electric vehicle built entirely by students, raced annually at Formula Sun Grand Prix and the American Solar Challenge. I led firmware across all embedded subsystems for two vehicles over three years.

The system is a 5-node CAN network of STM32 microcontrollers running FreeRTOS, covering battery management, high-voltage power distribution, driver controls, telemetry, and motor interface. Every node was designed and validated by the team, with no off-the-shelf embedded stacks.

The most technically involved subsystem was the battery management system, which monitors 288 lithium-ion cells in an 8P36S 150V pack. That involved isolated SPI communication to LTC6811 front-end ICs, passive cell balancing, thermistor monitoring, and an extended Kalman filter for state-of-charge estimation fused with Coulomb counting and voltage mapping.

At competition, the car completed 54 laps of a 3.15 mile track with 0 electrical failures, placing in the top 10 and becoming the first Canadian single-occupant vehicle team to pass scrutineering.
