---
title: 'Vehicle Update System: Flash-over-CAN and Firmware-over-the-Air Bootloader'
summary: A network-wide firmware update system for the solar car, with a custom datagram
  protocol, Python command-line tooling, and a bare-metal bootloader in ARM assembly
  and C.
team: Midnight Sun Solar Car
repo: https://github.com/Akashem06/midnight-sun
stack:
- C
- ARM Assembly
- CAN
- STM32
- Python
- CRC32
- MPU
features:
- Designed a custom datagram packet protocol with daisy-chaining support for network-wide
  firmware updates across all vehicle nodes.
- Built a Python command-line tool that automates 90% of the datagram streaming workflow
  for application flashing
- bootloader jumping
- and configuration editing.
- Integrated watchdog timers
- CRC32 flash integrity checks
- and memory protection to prevent packet loss from corrupting firmware
- achieving a 45 KB application flash in under 2.9 seconds.
- Reduced bootloader size by 70% with a bare-metal hardware abstraction layer for
  CAN and flash memory
- using ARM assembly to manage the main stack pointer and interrupt vector table location
  during application jumps.
challenges: Getting reliable firmware updates over CAN across multiple nodes without
  any node hanging the bus took careful protocol design. The datagram layer handles
  sequencing, retransmission on loss, and CRC validation before the flash write is
  committed. The trickiest part was the ARM assembly required to relocate the vector
  table and reset the stack pointer cleanly before jumping to application code, since
  any mistake there bricks the node mid-field.
image: /assets/images/projects/bootloader.jpg
gallery:
- image: /assets/images/projects/vehicle-update-system-flash-over-can-and-firmware-over-the-air-bootloader/screenshot-2025-06-11-235634.jpg
  thumb: /assets/images/projects/vehicle-update-system-flash-over-can-and-firmware-over-the-air-bootloader/thumb/screenshot-2025-06-11-235634.jpg
  alt: Architecture
featured: false
date: '2025-06-01'
---

A complete firmware update system for the Midnight Sun solar car, designed to flash any node on the vehicle's CAN network without physical access to the hardware.

The system is split into a C/Assembly bootloader running on each STM32 node and a Python command-line tool running off-car. The bootloader implements a custom datagram protocol with packet sequencing, CRC32 integrity checking, and watchdog-protected flash writes. If a packet is lost or corrupted, the session restarts cleanly rather than writing a partial image.

The Python tool automates the full streaming workflow. It segments the binary, transmits datagrams, monitors acknowledgments, and handles retries. About 90% of what used to be a manual process is now a single command.

The ARM assembly component handles the application jump itself: relocating the interrupt vector table, resetting the main stack pointer to the application's value, and branching to the reset handler. Getting this right in bare metal, without any operating system underneath, required careful reading of the ARM Cortex-M architecture reference.

Final numbers: 45 KB application flash in under 2.9 seconds, with a bootloader small enough to leave generous space for the application image.
