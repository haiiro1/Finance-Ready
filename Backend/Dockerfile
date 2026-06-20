# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Install uv
RUN pip install uv

# Copy the project definition file and install dependencies
COPY pyproject.toml .
RUN uv pip install --system --no-cache -e ".[dev]"

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 8000

ENTRYPOINT ["sh", "entrypoint.sh"]