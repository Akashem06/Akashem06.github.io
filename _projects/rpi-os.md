---
title: 'ARM64 Operating System: Assembly and C Microkernel for Raspberry Pi 4'
summary: A bare-metal ARM64 operating system for the Raspberry Pi 4 with a preemptive
  scheduler, memory manager, peripheral drivers, GPU communication, and a Breakout
  game demo.
repo: https://github.com/Akashem06/RaspberryPi-OS
stack:
- ARM64 Assembly
- C
- Raspberry Pi 4
- GPU
- DMA
- I2C
- SPI
- UART
- FreeRTOS
features:
- Designed an ARM64 microkernel with a preemptive
- priority-based round-robin scheduler supporting 64 concurrent tasks.
- Implemented Linux-inspired abstractions including system calls
- process control blocks
- a boot script
- ARM stub code
- memory management
- and a printf library.
- Brought up peripheral drivers for I2C
- SPI
- PCM
- I2S
- UART
- GPIO
- and timers
- with interrupt controller and interrupt service routine handling and clean kernel
  entry and exit routines.
- Implemented GPU communication through the VideoCore mailbox interface
- supporting 32
- '16'
- and 8-bit framebuffers for graphics output.
- Wrote ARM assembly for interrupt handling
- context switching
- the pre-main startup script
- spinlocks
- and safe peripheral register access.
- Built a Breakout game demo application using DMA-accelerated framebuffer uploads
- boosting rendering throughput by 450%.
challenges: Context switching in bare metal requires saving and restoring every general-purpose
  register, the link register, the stack pointer, and the processor state flags atomically.
  Getting that wrong produces corrupted task state that is nearly impossible to debug
  with a serial terminal as your only output. The other hard part was the GPU mailbox
  interface, which is underdocumented and requires careful cache coherency management
  between the ARM cores and the VideoCore.
image: /assets/images/projects/arm64-operating-system-assembly-and-c-microkernel-for-raspberry-pi-4/cover.jpg
featured: true
date: '2024-09-01'
---

A bare-metal operating system for the Raspberry Pi 4, written in ARM64 Assembly and C with no external libraries or operating system underneath.

The kernel includes a preemptive scheduler with priority-based round-robin dispatch across 64 concurrent tasks, a slab-style memory allocator, and a virtual file system layer backed by a simple on-disk format. System calls follow a Linux-style interface, dispatched through the ARM exception vector table.

Peripheral support covers most of the Raspberry Pi 4's hardware: I2C, SPI, PCM audio, I2S, the mini-UART and full PL011 UART, GPIO, and multiple hardware timers. The interrupt controller is fully managed by the kernel, with clean entry and exit routines that preserve task context.

GPU communication goes through the VideoCore mailbox protocol, which lets the kernel negotiate framebuffer parameters and write pixels directly to the display output. The Breakout demo uses DMA to transfer framebuffer updates without stalling the ARM cores, which accounted for the 450% throughput improvement over software-copy.

The project also includes 5+ sample applications demonstrating the scheduler, file system, peripheral drivers, and graphics pipeline.
