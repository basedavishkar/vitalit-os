#!/usr/bin/env python3
"""
VITALIt-OS Setup
Enterprise Hospital Management System
"""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

with open("requirements.txt", "r", encoding="utf-8") as fh:
    requirements = [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="vitalit-os",
    version="1.0.0",
    author="VITALIt-OS Team",
    author_email="support@vitalit-os.com",
    description="Enterprise Hospital Management System",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/your-username/vitalit-os",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Healthcare Industry",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.9",
    install_requires=requirements,
    entry_points={
        "console_scripts": [
            "vitalit=main:main",
        ],
    },
    include_package_data=True,
    package_data={
        "backend": ["*.py", "routers/*.py", "*.yml", "*.yaml"],
    },
) 