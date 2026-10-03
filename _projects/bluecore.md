---
title: 'BlueCore: Custom Bluetooth Low Energy Stack for Raspberry Pi 4'
summary: A from-scratch Bluetooth LE host stack built for my Raspberry Pi 4 OS, covering
  the host controller interface, generic access profile, and generic attribute profile
  layers.
repo: https://github.com/Akashem06/BlueCore
stack:
- ARM64 Assembly
- C
- Bluetooth LE
- HCI
- GAP
- GATT
- Raspberry Pi 4
features:
- Designed a complete Bluetooth LE host stack including host controller interface
  (HCI), generic access profile (GAP), and generic attribute profile layers (GATT),
  integrated directly into my Raspberry Pi 4 operating system.
- Built a bare-metal host controller interface transport layer with Broadcom-specific
  vendor extensions and event handling, enabling direct communication with the on-chip
  Bluetooth controller.
- Implemented a full generic access profile layer covering targeted advertising, scanning
- and connection lifecycle management.
- Engineered a generic attribute profile server and client architecture with the attribute
  protocol and service discovery.
- Created a test suite validating protocol behavior across all stack layers, achieving
  reliable connectivity in under 7.3 seconds.
challenges: The host controller interface transport on the Raspberry Pi 4 uses a Broadcom-specific
  UART protocol with vendor-defined opcodes and event codes that are not part of the
  public Bluetooth specification. Reverse engineering the initialization sequence
  from open-source Linux driver code and Broadcom datasheets took most of the early
  project time. Getting the GATT attribute database to serialize and deserialize correctly
  for service discovery was the other major debugging session, since any length or
  type field error produces a silent failure on the central side.
image: /assets/images/projects/bluecore-custom-bluetooth-low-energy-stack-for-raspberry-pi-4/cover.jpg
gallery:
- alt: Architecture
  image: /assets/images/projects/bluecore-custom-bluetooth-low-energy-stack-for-raspberry-pi-4/screenshot-2025-06-16-232951.jpg
  thumb: /assets/images/projects/bluecore-custom-bluetooth-low-energy-stack-for-raspberry-pi-4/thumb/screenshot-2025-06-16-232951.jpg
featured: false
date: '2024-09-01'
---

A from-scratch Bluetooth Low Energy host stack, built as a companion to my ARM64 Raspberry Pi 4 operating system.

The stack implements the standard Bluetooth LE host architecture: a host controller interface layer that talks to the hardware controller, a generic access profile layer that manages advertising, scanning, and connection state, and a generic attribute profile layer that exposes services and handles attribute reads and writes.

The host controller interface transport is the unusual part. The Raspberry Pi 4's Broadcom BCM4345C0 chip uses a UART-based HCI variant with proprietary initialization commands that are not documented in the Bluetooth core specification. The implementation is based on analysis of open-source Linux Bluetooth driver code and tested against a standard Bluetooth LE central on a phone.

Everything above the transport is spec-compliant: advertising, scanning, connection parameter negotiation, pairing, service discovery, and characteristic reads and writes. The test suite exercises each layer independently and validates end-to-end connectivity, including name streaming from a peripheral role, which is what the portfolio demo shows.
