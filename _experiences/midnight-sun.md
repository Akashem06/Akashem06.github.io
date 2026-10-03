---
company: Midnight Sun Solar Car Team
title: Vehicle Firmware Lead
company_url: https://www.uwmidsun.com
logo: /assets/images/experiences/midnight-sun.png
location: Waterloo, ON
type: Internship
start_date: Sept 2023
end_date: Aug 2026
stack:
- C
- C++
- FreeRTOS
- CAN
- SPI
- I2C
- STM32
- Python
- MATLAB
- Simulink
- TCP/IP
highlights:
- Led end-to-end firmware design for the battery management system, power distribution,
  driver controls, and telemetry across 2 solar electric vehicles.
- Built a C++ software-in-the-loop testing framework with a TCP/IP server-client architecture
- enabling full system testing without physical hardware.
- Integrated a FreeRTOS architecture with multirate task scheduling and less than
  5% loop jitter across safety-critical subsystems.
- Achieved 78% state-of-charge estimation accuracy using a state space battery model
  and a custom extended Kalman filter implemented in MATLAB.
- Developed battery management system firmware for 288 lithium-ion cells over isolated
  SPI and I2C, with passive cell balancing holding pack imbalance under 50 mV.
- Secured top 10 finishes at 2 annual competitions, as the first Canadian single-occupant
  vehicle team to pass scrutineering, with 0 electrical failures over 54 laps on a
  3.15 mile track.
- Led a 20-member software team through design and delivery of embedded systems for
  both vehicles.
gallery:
- alt: Midnight Sun
  image: /assets/images/experiences/midnight-sun-solar-car-team/midnightsun.jpg
  thumb: /assets/images/experiences/midnight-sun-solar-car-team/thumb/midnightsun.jpg
date: '2023-09-01'
featured: true
---

Vehicle Firmware Lead on the Midnight Sun Solar Car Team at the University of Waterloo. Over three years the role covered every embedded subsystem on the car, from high-voltage battery protection to driver controls and live telemetry. I led 2 vehicles, MS15 and MS16, from 2023 to 2026. The team raced under FSGP and ASC rules, and all firmware ran on a distributed CAN-based network of STM32 nodes running FreeRTOS.
