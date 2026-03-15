# Dataset format

Use a CSV with the following columns:

| Column | Type | Description |
|---|---|---|
| `complaint_id` | string | Unique complaint identifier |
| `complaint_text` | string | Citizen complaint description |
| `category` | string | Ground-truth issue category |
| `severity_level` | string | `Low`, `Medium`, `High`, or `Critical` |
| `latitude` | float | Complaint latitude |
| `longitude` | float | Complaint longitude |
| `ward` | string | Administrative ward or locality |
| `address` | string | Address or landmark |
| `image_tags` | string | Optional comma-separated image metadata |
| `status` | string | `Pending`, `In Progress`, or `Resolved` |
| `created_at` | datetime | Complaint creation time |
| `resolved_at` | datetime | Resolution time if available |
| `response_time_hours` | float | Historical response duration |

This sample is designed for quick experimentation and demo training rather than production-scale accuracy.
