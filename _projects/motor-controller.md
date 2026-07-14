---
title: '24V Motor Controller: Field-Oriented Control and 6-Block Commutation'
summary: A custom BLDC motor control library and 4-layer PCB for a 24V 10A motor controller,
  supporting both sensored Hall and sensorless back-EMF control with discrete-time
  field-oriented control.
repo: https://github.com/Akashem06/Jupiter
stack:
- C
- STM32
- KiCad
- CAN
- ADC
- PWM
- Clarke/Park transforms
- FOC
- Space Vector Modulation
features:
- Built a BLDC motor driver supporting back-EMF zero-crossing detection for sensorless
  control and Hall sensor feedback for sensored commutation.
- Implemented discrete-time field-oriented control using Clarke and Park transforms
- Space Vector Modulation
- and PID current loops
- achieving low torque ripple and high efficiency.
- Added field-weakening by modulating the direct-axis current to reduce back-EMF
- extending the RPM range without any hardware changes.
- Designed a 4-layer PCB for 24V and 10A operation
- with an optimized 3-phase inverter layout
- high-voltage isolation
- and a CAN interface for external speed control.
challenges: The field-oriented control loop runs at a fixed interrupt rate, so every
  Clarke transform, Park transform, and PID update has to complete within that window
  or the current regulation breaks down. Getting the discrete-time tuning right without
  an expensive current probe took a lot of iteration on the PID gains and timing margins.
  The sensorless back-EMF zero-crossing detection is also noise-sensitive at low speeds,
  so the control mode handoff between startup and running required careful threshold
  design.
image: /assets/images/projects/24v-motor-controller-field-oriented-control-and-6-block-commutation/cover.jpg
gallery:
- image: /assets/images/projects/24v-motor-controller-field-oriented-control-and-6-block-commutation/screenshot-2025-06-18-183116.jpg
  thumb: /assets/images/projects/24v-motor-controller-field-oriented-control-and-6-block-commutation/thumb/screenshot-2025-06-18-183116.jpg
  alt: Motor Controller Architecture
- image: /assets/images/projects/24v-motor-controller-field-oriented-control-and-6-block-commutation/screenshot-2025-07-06-090038.jpg
  thumb: /assets/images/projects/24v-motor-controller-field-oriented-control-and-6-block-commutation/thumb/screenshot-2025-07-06-090038.jpg
  alt: 6 Step
- image: /assets/images/projects/24v-motor-controller-field-oriented-control-and-6-block-commutation/screenshot-2025-07-06-084951.jpg
  thumb: /assets/images/projects/24v-motor-controller-field-oriented-control-and-6-block-commutation/thumb/screenshot-2025-07-06-084951.jpg
  alt: SVPWM
featured: false
date: '2025-03-01'
---

A motor control library and hardware platform for brushless DC motors, built from scratch as a personal project.

The library supports two control modes: sensored commutation using Hall effect sensors and sensorless commutation using back-EMF zero-crossing detection. On top of that is a full discrete-time field-oriented control implementation, covering Clarke and Park transforms for reference frame conversion, Space Vector Modulation for the PWM output, and PID loops for direct and quadrature axis current regulation.

Field-weakening is supported by injecting a negative direct-axis current reference, which reduces the back-EMF at high speeds and allows the motor to spin faster than its base speed without exceeding the inverter voltage limit.

The PCB is a 4-layer board designed in KiCad. The power stage uses a 3-phase MOSFET inverter with a gate driver, optimized for low-inductance layout and good thermal performance. A CAN interface lets an external controller send speed or torque setpoints.
