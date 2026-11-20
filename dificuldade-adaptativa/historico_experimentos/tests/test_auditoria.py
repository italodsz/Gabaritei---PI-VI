import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


class AuditEvidenceTests(unittest.TestCase):
    root = Path(__file__).resolve().parents[1]

    @classmethod
    def setUpClass(cls):
        root = Path(__file__).resolve().parents[1]
        cls.dataset = Path(os.environ.get(
            "GABARITEI_DATASET", root.parent / "base-oficial/Dataset/base_trabalho"
        )).resolve()
        cls.script = root / "experiments/fase_01_auditoria.py"
        with tempfile.TemporaryDirectory(dir=cls.root) as directory:
            output = Path(directory) / "fresh.json"
            run = cls.audit(cls.dataset, output)
            if run.returncode:
                raise RuntimeError(run.stderr)
            cls.result = json.loads(output.read_text(encoding="utf8"))

    @classmethod
    def audit(cls, dataset, output):
        return subprocess.run(
            [sys.executable, str(cls.script), str(dataset), "--output", str(output)],
            capture_output=True, text=True, encoding="utf8",
            env={**os.environ, "PYTHONIOENCODING": "utf-8"},
        )

    def test_counts_and_cutoffs(self):
        self.assertEqual(self.result["catalog_count"], 2971)
        self.assertEqual(
            [self.result["splits"][split]["eligible"] for split in ("train", "validation", "test")],
            [1801, 136, 126],
        )
        self.assertAlmostEqual(self.result["difficulty_cutoffs"][0], 0.80054)
        self.assertAlmostEqual(self.result["difficulty_cutoffs"][1], 1.56301)

    def test_integrity_and_event_scope(self):
        self.assertEqual(
            self.result["hashes"]["data/questions.jsonl"],
            "22d83ac5d269976b647d34cb8aa66ccbebec6c21b0773487926eb294ee69fbd5",
        )
        self.assertIn("split_isolation", self.result["checks_passed"])
        self.assertIn("blocked_items", self.result["checks_passed"])
        self.assertEqual(self.result["student_event_fields"], [])

    def test_modified_catalog_is_rejected(self):
        with tempfile.TemporaryDirectory(dir=self.root) as directory:
            copy = Path(directory) / "dataset"
            shutil.copytree(self.dataset, copy)
            with (copy / "data/questions.jsonl").open("ab") as catalog:
                catalog.write(b"\n")
            output = Path(directory) / "invalid.json"
            run = self.audit(copy, output)
            self.assertNotEqual(run.returncode, 0)
            self.assertIn("SHA-256 divergente", run.stderr)
            self.assertFalse(output.exists())
