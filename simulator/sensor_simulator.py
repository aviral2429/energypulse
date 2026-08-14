#!/usr/bin/env python3
"""
EnergyPulse — Campus Energy Monitoring Dashboard
IoT Sensor Data Simulator

Simulates real-time IoT energy meter telemetry for campus buildings
and streams readings to Google Cloud Firestore.
"""

import sys
import os
import time
import math
import random
import argparse
import signal
from datetime import datetime

# Reconfigure stdout for UTF-8 output on Windows standard console
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


# ANSI Color codes for rich terminal logging
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    DIM = '\033[2m'

# Default 15 Campus Devices across 5 Buildings
PRESET_DEVICES = [
    # Science Block
    {
        "id": "DEV-SCI-01",
        "name": "HVAC Unit 1 (Lab Wing)",
        "building": "Science Block",
        "type": "HVAC",
        "location": "Roof West",
        "baseCurrent": (8.0, 15.0),
        "powerFactor": 0.92,
        "maxRatingKW": 4.5,
        "thresholdCurrent": 18.0
    },
    {
        "id": "DEV-SCI-02",
        "name": "Main Lab Bench Array",
        "building": "Science Block",
        "type": "Lab Equipment",
        "location": "Floor 2, Room 204",
        "baseCurrent": (3.0, 10.0),
        "powerFactor": 0.95,
        "maxRatingKW": 3.0,
        "thresholdCurrent": 12.0
    },
    {
        "id": "DEV-SCI-03",
        "name": "Server Room AC Unit",
        "building": "Science Block",
        "type": "HVAC",
        "location": "Basement B1",
        "baseCurrent": (9.0, 14.0),
        "powerFactor": 0.94,
        "maxRatingKW": 4.0,
        "thresholdCurrent": 16.5
    },

    # Admin Block
    {
        "id": "DEV-ADM-01",
        "name": "Main Floor Lighting",
        "building": "Admin Block",
        "type": "Lighting",
        "location": "Ground Floor Lobby",
        "baseCurrent": (1.0, 5.0),
        "powerFactor": 0.98,
        "maxRatingKW": 1.5,
        "thresholdCurrent": 6.5
    },
    {
        "id": "DEV-ADM-02",
        "name": "Executive Elevator",
        "building": "Admin Block",
        "type": "Elevator",
        "location": "Central Shaft",
        "baseCurrent": (10.0, 30.0), # Intermittent active load
        "powerFactor": 0.88,
        "maxRatingKW": 8.0,
        "thresholdCurrent": 35.0
    },
    {
        "id": "DEV-ADM-03",
        "name": "Central Server Rack",
        "building": "Admin Block",
        "type": "IT Infrastructure",
        "location": "Floor 3 Datacenter",
        "baseCurrent": (2.0, 8.0),
        "powerFactor": 0.97,
        "maxRatingKW": 2.5,
        "thresholdCurrent": 10.0
    },

    # Library
    {
        "id": "DEV-LIB-01",
        "name": "Reading Hall HVAC",
        "building": "Library",
        "type": "HVAC",
        "location": "Main Atrium",
        "baseCurrent": (8.0, 15.0),
        "powerFactor": 0.91,
        "maxRatingKW": 4.5,
        "thresholdCurrent": 18.0
    },
    {
        "id": "DEV-LIB-02",
        "name": "Desk Lighting Grid",
        "building": "Library",
        "type": "Lighting",
        "location": "Floors 1-3",
        "baseCurrent": (1.0, 5.0),
        "powerFactor": 0.99,
        "maxRatingKW": 1.5,
        "thresholdCurrent": 6.5
    },
    {
        "id": "DEV-LIB-03",
        "name": "Digital Archive Servers",
        "building": "Library",
        "type": "IT Infrastructure",
        "location": "Basement Archive",
        "baseCurrent": (2.0, 8.0),
        "powerFactor": 0.96,
        "maxRatingKW": 2.2,
        "thresholdCurrent": 9.5
    },

    # Hostel
    {
        "id": "DEV-HST-01",
        "name": "Block A Water Heaters & HVAC",
        "building": "Hostel",
        "type": "HVAC",
        "location": "Utility Room",
        "baseCurrent": (8.0, 15.0),
        "powerFactor": 0.93,
        "maxRatingKW": 4.5,
        "thresholdCurrent": 18.0
    },
    {
        "id": "DEV-HST-02",
        "name": "Common Area Lighting",
        "building": "Hostel",
        "type": "Lighting",
        "location": "Corridors & Lounge",
        "baseCurrent": (1.0, 5.0),
        "powerFactor": 0.98,
        "maxRatingKW": 1.5,
        "thresholdCurrent": 6.5
    },
    {
        "id": "DEV-HST-03",
        "name": "Passenger Elevator",
        "building": "Hostel",
        "type": "Elevator",
        "location": "Block B Shaft",
        "baseCurrent": (10.0, 30.0),
        "powerFactor": 0.89,
        "maxRatingKW": 8.0,
        "thresholdCurrent": 35.0
    },

    # Sports Complex
    {
        "id": "DEV-SPT-01",
        "name": "Main Arena Floodlights",
        "building": "Sports Complex",
        "type": "Lighting",
        "location": "Indoor Stadium",
        "baseCurrent": (1.0, 5.0),
        "powerFactor": 0.97,
        "maxRatingKW": 2.0,
        "thresholdCurrent": 7.0
    },
    {
        "id": "DEV-SPT-02",
        "name": "Gymnasium HVAC",
        "building": "Sports Complex",
        "type": "HVAC",
        "location": "Gym North",
        "baseCurrent": (8.0, 15.0),
        "powerFactor": 0.90,
        "maxRatingKW": 4.2,
        "thresholdCurrent": 17.5
    },
    {
        "id": "DEV-SPT-03",
        "name": "Pool Filtration & Pumps",
        "building": "Sports Complex",
        "type": "Other",
        "location": "Aquatics Center",
        "baseCurrent": (3.0, 10.0),
        "powerFactor": 0.94,
        "maxRatingKW": 3.0,
        "thresholdCurrent": 12.0
    }
]

BUILDINGS = ["Science Block", "Admin Block", "Library", "Hostel", "Sports Complex"]
DEVICE_TYPES = ["HVAC", "Lighting", "Lab Equipment", "Elevator", "IT Infrastructure", "Other"]


class SensorSimulator:
    def __init__(self, key_path, interval=5, num_devices=15, user_id="demo-user", dry_run=False):
        self.key_path = key_path
        self.interval = interval
        self.num_devices = num_devices
        self.user_id = user_id
        self.dry_run = dry_run
        self.db = None
        self.devices = []
        self.accumulated_energy = {}
        self.running = True

        self.setup_signal_handlers()
        self.initialize_firebase()
        self.setup_devices()

    def setup_signal_handlers(self):
        """Catch interrupt signals for graceful shutdown."""
        signal.signal(signal.SIGINT, self.graceful_shutdown)
        signal.signal(signal.SIGTERM, self.graceful_shutdown)

    def graceful_shutdown(self, signum, frame):
        """Handle Ctrl+C cleanly."""
        print(f"\n{Colors.WARNING}===================================================={Colors.ENDC}")
        print(f"{Colors.WARNING} Shutting down EnergyPulse Sensor Simulator... {Colors.ENDC}")
        print(f"{Colors.WARNING}===================================================={Colors.ENDC}")
        self.running = False

    def initialize_firebase(self):
        """Initialize Firebase Admin SDK or fall back to dry-run mode."""
        if self.dry_run:
            print(f"{Colors.OKCYAN}[INFO] Running in DRY-RUN mode. Data will be printed to console only.{Colors.ENDC}")
            return

        if not self.key_path or not os.path.exists(self.key_path):
            print(f"{Colors.WARNING}[WARN] Firebase service account key not found at '{self.key_path}'.{Colors.ENDC}")
            print(f"{Colors.WARNING}[WARN] Switching to DRY-RUN mode automatically.{Colors.ENDC}")
            print(f"{Colors.DIM}       To write live data to Firestore, provide a valid key: python sensor_simulator.py --key path/to/serviceAccountKey.json{Colors.ENDC}\n")
            self.dry_run = True
            return

        try:
            import firebase_admin
            from firebase_admin import credentials, firestore

            cred = credentials.Certificate(self.key_path)
            firebase_admin.initialize_app(cred)
            self.db = firestore.client()
            print(f"{Colors.OKGREEN}[SUCCESS] Connected to Firebase Firestore project via Admin SDK.{Colors.ENDC}")
        except Exception as e:
            print(f"{Colors.FAIL}[ERROR] Failed to initialize Firebase: {e}{Colors.ENDC}")
            print(f"{Colors.WARNING}[WARN] Falling back to DRY-RUN mode.{Colors.ENDC}")
            self.dry_run = True

    def setup_devices(self):
        """Generate device metadata up to target device count."""
        self.devices = list(PRESET_DEVICES[:min(self.num_devices, len(PRESET_DEVICES))])

        # If user requested more than 15 devices, dynamically generate extras
        if self.num_devices > len(self.devices):
            for i in range(len(self.devices) + 1, self.num_devices + 1):
                bldg = BUILDINGS[i % len(BUILDINGS)]
                dtype = DEVICE_TYPES[i % len(DEVICE_TYPES)]
                dev_id = f"DEV-GEN-{i:02d}"

                if dtype == "HVAC":
                    base_i = (8.0, 15.0)
                    max_kw = 4.5
                elif dtype == "Lighting":
                    base_i = (1.0, 5.0)
                    max_kw = 1.5
                elif dtype == "Lab Equipment":
                    base_i = (3.0, 10.0)
                    max_kw = 3.0
                elif dtype == "Elevator":
                    base_i = (10.0, 30.0)
                    max_kw = 8.0
                elif dtype == "IT Infrastructure":
                    base_i = (2.0, 8.0)
                    max_kw = 2.5
                else:
                    base_i = (1.0, 10.0)
                    max_kw = 3.0

                self.devices.append({
                    "id": dev_id,
                    "name": f"{dtype} Sensor {i}",
                    "building": bldg,
                    "type": dtype,
                    "location": f"Wing {chr(65 + (i % 4))}",
                    "baseCurrent": base_i,
                    "powerFactor": 0.95,
                    "maxRatingKW": max_kw,
                    "thresholdCurrent": base_i[1] * 1.5
                })

        # Initialize accumulated energy (in kWh) for each device
        for d in self.devices:
            self.accumulated_energy[d["id"]] = random.uniform(12.5, 150.0)

    def provision_firestore_documents(self):
        """Create or update initial device metadata in Firestore when --setup is flagged."""
        if self.dry_run:
            print(f"{Colors.OKCYAN}[SETUP] Dry-run: Would provision {len(self.devices)} device documents in Firestore 'devices' collection.{Colors.ENDC}")
            return

        from firebase_admin import firestore
        print(f"{Colors.HEADER}[SETUP] Provisioning {len(self.devices)} device documents in Firestore...{Colors.ENDC}")

        batch = self.db.batch()
        for dev in self.devices:
            dev_ref = self.db.collection('devices').document(dev["id"])
            doc_data = {
                "id": dev["id"],
                "name": dev["name"],
                "building": dev["building"],
                "type": dev["type"],
                "location": dev["location"],
                "maxKW": dev["maxRatingKW"],
                "ratedVoltage": 230,
                "status": "online",
                "userId": self.user_id,
                "createdAt": firestore.SERVER_TIMESTAMP,
                "updatedAt": firestore.SERVER_TIMESTAMP
            }
            batch.set(dev_ref, doc_data, merge=True)

        batch.commit()
        print(f"{Colors.OKGREEN}[SETUP] Successfully provisioned {len(self.devices)} devices to Firestore!{Colors.ENDC}\n")

    def get_time_of_day_multiplier(self, now):
        """
        Calculates time-of-day demand multiplier.
        - Peak demand 8 AM - 6 PM with noon spike (up to 1.35x)
        - Off-peak at night (0.45x - 0.6x)
        """
        hour_float = now.hour + (now.minute / 60.0) + (now.second / 3600.0)

        # Base curve using sinusoidal function centered around 1:00 PM (13:00)
        if 8.0 <= hour_float <= 18.0:
            # Daytime curve peaking at noon-1PM
            factor = 1.0 + 0.35 * math.sin(math.pi * (hour_float - 8.0) / 10.0)
        else:
            # Nighttime low usage
            factor = 0.45 + 0.15 * math.cos(math.pi * (hour_float - 18.0) / 14.0)

        return factor

    def get_day_of_week_multiplier(self, now):
        """Lower usage on weekends (Saturday & Sunday)."""
        weekday = now.weekday() # 0 = Monday, 6 = Sunday
        if weekday in (5, 6):
            return 0.65 # 35% reduction on weekends
        return 1.0

    def generate_reading(self, device, now):
        """Generates realistic telemetry values for a single device."""
        dev_id = device["id"]
        dev_type = device["type"]

        # Base voltage with small noise: 220V - 240V centered around 230V
        voltage = round(random.normalvariate(230.0, 2.5), 1)
        voltage = max(218.0, min(242.0, voltage))

        # Time of day and week factors
        tod_mult = self.get_time_of_day_multiplier(now)
        dow_mult = self.get_day_of_week_multiplier(now)

        # Base current range
        min_i, max_i = device["baseCurrent"]

        if dev_type == "Elevator":
            # Elevator is intermittent: 75% chance resting/idle, 25% active movement
            if random.random() > 0.25:
                current_raw = random.uniform(0.5, 2.0)
            else:
                current_raw = random.uniform(15.0, max_i)
        else:
            current_raw = random.uniform(min_i, max_i)

        current = current_raw * tod_mult * dow_mult

        # Anomaly simulation: 2% chance of 3x current spike
        is_anomaly = False
        if random.random() < 0.02:
            is_anomaly = True
            current = current * 3.1 # Overcurrent spike

        current = round(current, 2)

        # Calculate power (kW) = (V * I * PF) / 1000
        pf = device.get("powerFactor", 0.95)
        power_kw = round((voltage * current * pf) / 1000.0, 3)

        # Accumulate energy (kWh)
        hours_elapsed = self.interval / 3600.0
        self.accumulated_energy[dev_id] += power_kw * hours_elapsed
        energy_kwh = round(self.accumulated_energy[dev_id], 4)

        # Determine status
        status = "alert" if (is_anomaly or current > device["thresholdCurrent"]) else "online"

        return {
            "deviceId": dev_id,
            "deviceName": device["name"],
            "building": device["building"],
            "voltage": voltage,
            "current": current,
            "powerKW": power_kw,
            "energyKWh": energy_kwh,
            "isAnomaly": is_anomaly,
            "thresholdCurrent": device["thresholdCurrent"],
            "status": status
        }

    def run(self):
        """Main simulation loop."""
        print(f"\n{Colors.HEADER}===================================================={Colors.ENDC}")
        print(f"{Colors.HEADER}  EnergyPulse IoT Sensor Simulator Starting...        {Colors.ENDC}")
        print(f"{Colors.HEADER}===================================================={Colors.ENDC}")
        print(f"{Colors.OKCYAN} Devices Monitored : {len(self.devices)}{Colors.ENDC}")
        print(f"{Colors.OKCYAN} Poll Interval     : {self.interval}s{Colors.ENDC}")
        print(f"{Colors.OKCYAN} User ID Target    : {self.user_id}{Colors.ENDC}")
        print(f"{Colors.OKCYAN} Storage Mode      : {'DRY-RUN (Console)' if self.dry_run else 'Firestore Live'}{Colors.ENDC}")
        print(f"{Colors.HEADER}----------------------------------------------------{Colors.ENDC}\n")

        iteration = 0

        while self.running:
            iteration += 1
            now = datetime.now()
            time_str = now.strftime("%H:%M:%S")

            print(f"{Colors.BOLD}[Tick #{iteration:04d} | {time_str}]{Colors.ENDC} Generating telemetry for {len(self.devices)} devices...")

            readings_to_write = []
            alerts_to_create = []

            for dev in self.devices:
                reading = self.generate_reading(dev, now)
                readings_to_write.append(reading)

                # Format log text
                if reading["isAnomaly"]:
                    status_badge = f"{Colors.FAIL}{Colors.BOLD}[SPIKE ANOMALY]{Colors.ENDC}"
                elif reading["status"] == "alert":
                    status_badge = f"{Colors.WARNING}[OVERCURRENT]{Colors.ENDC}"
                else:
                    status_badge = f"{Colors.OKGREEN}[NORMAL]{Colors.ENDC}"

                print(f"  {Colors.DIM}>{Colors.ENDC} {Colors.OKBLUE}{dev['id']}{Colors.ENDC} ({dev['building']} - {dev['name'][:22]}...): "
                      f"{reading['voltage']}V | {reading['current']:>5.2f}A | {Colors.BOLD}{reading['powerKW']:>5.3f} kW{Colors.ENDC} | "
                      f"Acc: {reading['energyKWh']:>7.3f} kWh {status_badge}", flush=True)

                # If anomaly or threshold surpassed, draft alert object
                if reading["isAnomaly"] or reading["current"] > dev["thresholdCurrent"]:
                    alerts_to_create.append({
                        "deviceId": dev["id"],
                        "deviceName": dev["name"],
                        "building": dev["building"],
                        "type": "anomaly_spike" if reading["isAnomaly"] else "overcurrent",
                        "severity": "critical" if reading["isAnomaly"] else "warning",
                        "message": f"Unusual load detected on {dev['name']}: {reading['current']}A (Limit: {dev['thresholdCurrent']}A)",
                        "status": "active",
                        "userId": self.user_id,
                        "value": reading["current"],
                        "threshold": dev["thresholdCurrent"]
                    })

            # Stream to Firestore if live mode
            if not self.dry_run and self.db:
                try:
                    from firebase_admin import firestore

                    # Batch write readings & device updates
                    batch = self.db.batch()

                    for r in readings_to_write:
                        # 1. Add document to 'readings' collection
                        reading_ref = self.db.collection('readings').document()
                        batch.set(reading_ref, {
                            "deviceId": r["deviceId"],
                            "timestamp": firestore.SERVER_TIMESTAMP,
                            "voltage": r["voltage"],
                            "current": r["current"],
                            "powerKW": r["powerKW"],
                            "energyKWh": r["energyKWh"],
                            "userId": self.user_id
                        })

                        # 2. Update device current state in 'devices' collection
                        dev_ref = self.db.collection('devices').document(r["deviceId"])
                        batch.set(dev_ref, {
                            "lastReading": {
                                "voltage": r["voltage"],
                                "current": r["current"],
                                "powerKW": r["powerKW"],
                                "timestamp": firestore.SERVER_TIMESTAMP
                            },
                            "currentPowerKW": r["powerKW"],
                            "totalEnergyKWh": r["energyKWh"],
                            "status": r["status"],
                            "updatedAt": firestore.SERVER_TIMESTAMP
                        }, merge=True)

                    # 3. Add alerts to 'alerts' collection
                    for a in alerts_to_create:
                        alert_ref = self.db.collection('alerts').document()
                        a["timestamp"] = firestore.SERVER_TIMESTAMP
                        batch.set(alert_ref, a)

                    batch.commit()
                    print(f"  {Colors.OKGREEN}[OK] Written {len(readings_to_write)} readings & {len(alerts_to_create)} alerts to Firestore.{Colors.ENDC}\n")

                except Exception as e:
                    print(f"  {Colors.FAIL}[ERR] Firestore write failed: {e}{Colors.ENDC}\n")
            else:
                print(f"  {Colors.OKCYAN}[INFO] [Dry-run] Simulated {len(readings_to_write)} readings & {len(alerts_to_create)} alerts.{Colors.ENDC}\n")

            # Wait for next interval
            time.sleep(self.interval)

        print(f"\n{Colors.OKGREEN}EnergyPulse Sensor Simulator stopped gracefully.{Colors.ENDC}")


def main():
    parser = argparse.ArgumentParser(
        description="EnergyPulse IoT Sensor Telemetry Simulator for Firebase Firestore."
    )
    parser.add_argument(
        "--key",
        type=str,
        default="serviceAccountKey.json",
        help="Path to Firebase Service Account JSON credentials key file."
    )
    parser.add_argument(
        "--interval",
        type=int,
        default=5,
        help="Telemetry sampling interval in seconds (default: 5)."
    )
    parser.add_argument(
        "--devices",
        type=int,
        default=15,
        help="Number of simulated IoT devices across campus (default: 15)."
    )
    parser.add_argument(
        "--setup",
        action="store_true",
        help="Flag to initialize/provision device documents in Firestore before starting telemetry loop."
    )
    parser.add_argument(
        "--user_id",
        type=str,
        default="demo-user",
        help="User ID to associate generated readings and alerts with (default: 'demo-user')."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Force console dry-run mode without connecting to Firebase."
    )

    args = parser.parse_args()

    simulator = SensorSimulator(
        key_path=args.key,
        interval=args.interval,
        num_devices=args.devices,
        user_id=args.user_id,
        dry_run=args.dry_run
    )

    if args.setup:
        simulator.provision_firestore_documents()

    simulator.run()


if __name__ == "__main__":
    main()
