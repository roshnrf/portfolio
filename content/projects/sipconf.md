---
title: sipconf
tagline: Systems · Real-time audio
summary: A multi-party SIP/RTP voice conference server in C11, written with only libc and Linux system calls. Sixteen callers mixed in real time on a single thread.
year: "2026"
order: 5
status: Personal project. The repository shows the design, results and code excerpts; the full source is private.
tags: [C11, POSIX, epoll, timerfd, SIP, RTP, SDP, G.711]
metrics:
  - value: 147 µs
    label: average mix time per 20 ms frame, 16 callers
  - value: < 1 ms
    label: slowest single frame measured
  - value: "16"
    label: concurrent callers, the 17th gets 486 Busy
  - value: "0"
    label: late ticks and lost packets in every test
repo: https://github.com/roshnrf/sip-rtp-conference-server
---

## Background

During my internship at DRDO I worked on real-time voice conferencing. A from-scratch POSIX approach was considered there and set aside in favour of an established VoIP stack, which is the right call for a production system.

I still wanted to know what the from-scratch version takes. sipconf is my own independent answer, written on my own time: a conference bridge with no PJSIP, no Asterisk and no third-party libraries. Any SIP softphone can dial in. The server mixes everyone's audio and sends each caller everyone except themselves (mix-minus).

## How it works

Everything runs in one thread. Every input is a file descriptor on a single `epoll` instance:

| Descriptor | Fires when |
| --- | --- |
| SIP socket (UDP) | a SIP request arrives |
| RTP socket, one per caller | a media packet arrives |
| `timerfd`, 20 ms interval | it is time to produce the next output frame |
| `signalfd` | SIGINT or SIGTERM, for a clean shutdown |

The work per event takes microseconds, so one thread is nowhere near saturated at 16 callers. A single thread also means no locks and no race between "packet arrived" and "mix now".

The `timerfd` is the media clock. Callers' clocks drift and their packets arrive in bursts, but output has to leave at a steady 50 packets per second. So mixing is driven by the timer, not by packet arrival.

```
         receive path (event-driven)                    send path (timer-driven)
RTP pkt -> parse -> G.711 decode -> assemble 160 -> JB -+
RTP pkt -> parse -> G.711 decode -> assemble 160 -> JB -+-> sum -> (sum - own) x gain -> encode -> RTP
RTP pkt -> parse -> G.711 decode -> assemble 160 -> JB -+
```

| Layer | Implementation |
| --- | --- |
| Signalling | SIP over UDP (RFC 3261 subset): INVITE, ACK, BYE, OPTIONS, CANCEL and re-INVITE. `486 Busy` when the room is full, `488` when there is no usable codec |
| Session description | SDP offer/answer, negotiating G.711 µ-law |
| Media | RTP (RFC 3550), with CSRC lists, header extensions and padding bounds-checked against the datagram length |
| Codec | G.711 µ-law encoder and decoder written from the ITU-T spec |
| Jitter buffer | Per-caller FIFO of 20 ms frames. Starts playout at 40 ms, re-primes after an underrun, drops the oldest frame on overflow so latency stays bounded at 160 ms |
| Mixer | One shared 32-bit sum per tick, then subtract each listener's own frame: O(N) instead of O(N²) |
| Limiter | Per-listener gain with instant attack and about 0.5 s release |
| NAT | Symmetric RTP: replies go to wherever the caller's media actually comes from |

## Testing

A simulator places real SIP calls. Each simulated caller streams a pure tone at its own frequency and records what it hears. A Goertzel filter then checks that every caller hears every other tone and not its own:

```
caller     tone  rx sec   power heard per tone (own tone in [ ])
0         350Hz    4.22   [   57dB]   114dB    114dB
1        1850Hz    4.22      114dB [  -30dB]   114dB
2        3350Hz    4.22      114dB    114dB [   73dB]

mix-minus check: PASS
```

The server was also built with AddressSanitizer and UBSan and fed malformed SIP and RTP. Every bad input was rejected or counted, with no crashes and no sanitizer reports.

## Results

Measured on a 2-vCPU Linux VM, `-O2`, loopback, with every caller talking continuously:

| Callers | Mix time per 20 ms frame (avg / max) | Late ticks | Packet loss |
| --- | --- | --- | --- |
| 3 | 49 µs / 135 µs | 0 | 0 |
| 8 | 79 µs / 719 µs | 0 | 0 |
| 12 | 78 µs / 316 µs | 0 | 0 |
| 16 (max) | 147 µs / 453 µs | 0 | 0 |

The slowest single frame took under 1 ms, less than 5% of the 20 ms budget. Processing is not where latency comes from:

| Component | Delay |
| --- | --- |
| Packetisation at the phone | 20 ms |
| Jitter buffer | 20 to 40 ms typical, 160 ms at most |
| Waiting for the next mixer tick | 0 to 20 ms |
| Mix and encode | about 0.05 to 0.15 ms |
| Codec look-ahead | 0 ms, G.711 has none |

Latency is set by buffering and codec choice.

## A bug the tests caught

The first version hard-clipped the mixed sum to 16 bits. It passed with 3 callers and failed at 12: each caller heard its own tone only about 12 dB below everyone else's.

With 11 people talking, the sum exceeded ±32767. Clipping distorted the waveform, and the distortion produced intermodulation products that landed on the listener's own frequency. In a real call that is harsh crackle whenever several people talk at once.

The fix was a per-listener limiter. If a frame's peak would exceed 30000, the whole frame is scaled down, and the gain then recovers over about half a second. Gain is constant within a frame, so it does not distort the waveform the way clipping does. Own-tone leakage dropped to about 35 to 55 dB below the other callers at every tested size up to 16.

## Limitations

- UDP and G.711 only: no TLS or SRTP, no Opus or wideband audio.
- A single conference room with fixed slots.
- No authentication. It is meant for trusted networks only.
- No session timers and no RTCP.
- The jitter buffer plays packets in arrival order, with no reordering or loss concealment.
- All measurements are on loopback, so they say nothing about behaviour on a lossy network.

## What I would add next

A per-caller noise-suppression stage such as RNNoise between decode and mix, wideband audio with Opus or G.722, RTCP reports and multiple rooms.
