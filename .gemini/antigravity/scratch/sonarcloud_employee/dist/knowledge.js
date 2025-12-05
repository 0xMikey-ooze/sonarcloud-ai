"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ESCALATION_TRIGGERS = exports.PRIORITY_GUIDELINES = exports.PRODUCT_KNOWLEDGE = void 0;
exports.PRODUCT_KNOWLEDGE = `
## SONARCLOUD PRODUCT KNOWLEDGE

### What We Provide
- AI-powered PA announcement systems
- Harmonious tone bells (replacing harsh traditional bells)
- Scheduling software for bells and announcements
- Hardware: speakers, amplifiers, control units, network equipment
- Integration with school networks

### Common Technical Issues and Solutions

**Audio Echo/Feedback**
- Cause: Microphone picking up speaker output, or multiple speakers in close proximity
- Solutions:
  1. Check microphone placement - should be 6+ feet from nearest speaker
  2. Reduce speaker volume in affected zone
  3. Enable echo cancellation in control panel
  4. Check for reflective surfaces near microphone

**DTMF Signaling Degradation**
- Cause: Network latency, codec compression, or interference
- Solutions:
  1. Switch to SIP INFO method instead of in-band DTMF
  2. Check network QoS settings - voice traffic needs priority
  3. Verify codec settings (G.711 preferred for DTMF reliability)
  4. Test with direct connection to isolate network issues

**No Audio Output**
- Cause: Network, power, or configuration issue
- Solutions:
  1. Verify power to amplifier (check LED indicators)
  2. Ping the control unit IP address
  3. Check zone assignments in admin panel
  4. Verify speaker wiring connections
  5. Test with backup announcement

**Bell Schedule Not Triggering**
- Cause: Time sync, schedule configuration, or system mode
- Solutions:
  1. Verify system time matches local time (NTP sync)
  2. Check if school is in "Holiday" or "Manual" mode
  3. Review schedule for correct days of week
  4. Confirm bell tone file exists and is valid
  5. Check for schedule conflicts or overlaps

**Network Connectivity Issues**
- Cause: DHCP, firewall, or VLAN configuration
- Solutions:
  1. Verify device has valid IP (check via local display or scan)
  2. Confirm ports 5060 (SIP) and 10000-20000 (RTP) are open
  3. Check VLAN tagging if on voice VLAN
  4. Test with static IP to rule out DHCP issues
  5. Verify gateway and DNS settings

**Announcement Quality Issues**
- Cause: Source audio, network bandwidth, or speaker hardware
- Solutions:
  1. Check source audio file quality (should be 16-bit, 16kHz minimum)
  2. Test network bandwidth (need 100kbps per concurrent stream)
  3. Inspect speaker for physical damage
  4. Check amplifier output levels

### Hardware Components
- **Control Unit**: Central brain, typically in server room or main office
- **Zone Controllers**: Distribute audio to speaker groups
- **Amplifiers**: Power the speakers, one per zone or building
- **Speakers**: Ceiling-mount or wall-mount, various wattages
- **Microphone Stations**: For live announcements, in offices

### Software Features
- Web-based admin panel (accessible via browser)
- Mobile app for administrators
- Scheduled announcements (recurring or one-time)
- Zone grouping (all-call, building, floor, classroom)
- Emergency override mode
- Bell schedule templates (regular day, half day, assembly)
- Text-to-speech for announcements
- Multi-language support
`;
exports.PRIORITY_GUIDELINES = `
## PRIORITY GUIDELINES

**High Priority:**
- Complete system outage (no audio anywhere)
- Emergency alert system not functioning
- Issue affecting entire school
- Safety-related concerns
- Issues during school hours affecting operations

**Medium Priority:**
- Single zone not working
- Intermittent issues
- Quality degradation
- Schedule not working correctly
- Feature not working as expected

**Low Priority:**
- Feature requests
- Questions about capabilities
- Training requests
- Minor cosmetic issues
- "Nice to have" improvements
`;
exports.ESCALATION_TRIGGERS = `
## ESCALATION TRIGGERS

Immediately escalate to human if:
- Customer mentions safety concern or emergency system failure
- Customer is angry or threatening to cancel
- Issue has been reported 3+ times without resolution
- You don't have enough information to troubleshoot
- Customer requests to speak to a human
- Billing dispute over $500
- Legal language or threats
`;
