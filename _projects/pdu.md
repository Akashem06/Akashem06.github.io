---
title: 'Power Distribution Unit: 18 Channels, 12V and 5V'
summary: Firmware for an 18-channel low-voltage power distribution board, with pre-charge
  management, overcurrent protection, and GPIO expanders over I2C.
team: Midnight Sun Solar Car
repo: https://github.com/Akashem06/midnight-sun
stack:
- C
- STM32
- I2C
- CAN
- FreeRTOS
- PCA9555
features:
- Designed power distribution firmware managing multiplexed 12V and 5V rails with
  overcurrent protection across 18 output channels.
- Built a power sequencing state machine with pre-charge management for the 150V motor
  system and solar array inputs.
- Added sensing for power path selection and input/output voltage and current on each
  rail
- enabling diagnostics for auxiliary and DC/DC converter paths.
- Implemented PCA9555 GPIO expander control over I2C to handle load enable
- overcurrent protection responses
- and rail multiplexing.
challenges: The main challenge was sequencing. The 150V motor bus needs a controlled
  pre-charge before the main contactor closes, and the solar arrays need to be brought
  online in a specific order relative to the battery. Any timing error or missed state
  transition can cause a large inrush current event. Modeling this as an explicit
  state machine made the sequencing logic auditable and testable in software-in-the-loop
  before any hardware was connected.
image: /assets/images/projects/power-distribution-unit-18-channels-12v-and-5v/cover.jpg
gallery:
- alt: Power Distribution Testing
  image: /assets/images/projects/power-distribution-unit-18-channels-12v-and-5v/powerdistribution.jpg
  thumb: /assets/images/projects/power-distribution-unit-18-channels-12v-and-5v/thumb/powerdistribution.jpg
- image: /assets/images/projects/power-distribution-unit-18-channels-12v-and-5v/screenshot-2025-06-08-230011.jpg
  thumb: /assets/images/projects/power-distribution-unit-18-channels-12v-and-5v/thumb/screenshot-2025-06-08-230011.jpg
  alt: Power Distrubtion Arch
featured: false
date: '2024-12-01'
---

Power distribution firmware for the Midnight Sun solar car, handling 18 output channels across 12V and 5V rails for all vehicle subsystems.

The board uses PCA9555 GPIO expanders over I2C to control load enables and overcurrent protection on each channel, giving the firmware visibility into every rail without consuming STM32 GPIO pins. Current and voltage sensing on each path enables AUX and DC/DC diagnostics during testing and in the field.

The pre-charge sequencer is the safety-critical part: before the main contactor closes and connects the 150V traction bus to the motor controller, the firmware steps through a pre-charge sequence to limit inrush current through the bus capacitors. Any fault during this window causes the system to hold in a safe state until the condition clears.
