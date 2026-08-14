# TeleSim 3D Student Guide

## Student Login

1. Open `/login`.
2. Enter your email or student number and password.
3. Select **Sign In**.

New students may use **Create Account** at `/register`. Registration creates student accounts only. Instructor and administrator accounts use the separate Staff Portal.

## Dashboard

The Dashboard summarizes overall progress, recent activity, skills progress, module status, latest score, best score, and attempt count from saved MySQL records. Select a module card or open **Training Modules** to begin.

## Entering the Laboratory

1. Open **Training Modules**.
2. Choose RJ45, Fiber, or Network training.
3. Select **Begin Training**.
4. Wait for the 3D laboratory to load, then click the canvas to activate first-person controls.

Use a desktop or laptop with WebGL enabled. If 3D graphics are unavailable, return to the Dashboard and use a supported browser/device.

## Controls

| Input | Action |
| --- | --- |
| Mouse | Look around after activating the canvas |
| `W`, `A`, `S`, `D` | Move |
| `Shift` | Run while moving |
| `E` | Interact with a highlighted workstation or object |
| `Escape` | Release pointer lock or leave a focused interaction |

Open the in-lab Help panel for the current control summary. Audio reinforces actions but visual status, prompts, and assessment feedback remain available when audio is muted.

## RJ45 Cable Termination

Complete the guided sequence in order:

1. Select the cable.
2. Strip the jacket with the visible stripper.
3. Separate the conductor pairs.
4. Manually arrange all eight conductors in T568B order.
5. Validate the arrangement.
6. Trim the conductors.
7. Insert them into the RJ45 connector.
8. Crimp the connector.
9. Test the cable and confirm the PASS result.
10. Complete the assessment and save the result.

The validation step does not automatically arrange the conductors. Use the readable wire colors and the displayed T568B reference.

## Fiber Optic Fusion Splicing

Complete both fiber ends through the guided workflow:

1. Strip and precision-strip the fiber.
2. Clean the prepared fiber with the wipe.
3. Cleave both ends.
4. Load fibers A and B into the splicer.
5. Clamp the fibers and close the lid.
6. Align and fuse.
7. Review splice loss.
8. Position the protection sleeve.
9. Heat and cool the sleeve.
10. Inspect the final splice.
11. Complete the assessment and save.

If a step is unavailable, read the procedure prompt and confirm the preceding preparation step is complete.

## Network Installation and Troubleshooting

The approved workstation layout is:

- Left: Preparation Table
- Center: Network Rack
- Right: PC Workstation

Install and power the devices, connect the required Ethernet links, configure the router and switch through their CLI panels, configure the PC IPv4 settings, and verify connectivity. Required connection targets include PDU Outlets 1 and 2, Switch Port 2, and Router G0/0.

Use these training addresses when prompted:

- Router G0/0: `192.168.10.1 / 255.255.255.0`
- Switch VLAN 1: `192.168.10.2 / 255.255.255.0`
- PC: `192.168.10.10 / 255.255.255.0`
- PC default gateway: `192.168.10.1`

Verify the PC can ping both the router and switch. Then complete the six guided scenarios: wrong PC IPv4 address, router interface down, switch management address error, default gateway error, physical cable fault, and device power fault.

## Results

Open `/results` to review saved attempts, scores, ratings, durations, timestamps, and module details. A result should remain after logout and a later login because completed attempts are stored in MySQL.

## Settings

Open `/settings` to adjust audio, visual quality, sensitivity, field of view, reduced motion, larger text, high contrast, and confirmation preferences. Settings affect presentation and controls; they do not change training scoring.

## Profile

Open `/profile` to review your account identity. Contact an administrator if account details or active status require correction.

## Logout

Use **Logout** from the application navigation. The server clears the HTTP-only session cookie and returns you to `/login`.
