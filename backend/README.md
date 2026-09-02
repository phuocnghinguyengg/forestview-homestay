# ForestView backend

## Reset and load sample data

The included sample-data reset is intentionally opt-in. Run the application once with:

```bash
APP_SAMPLE_DATA_RESET_ON_START=true ./mvnw spring-boot:run
```

It deletes reviews, bookings, discounts, holidays, rooms, and non-admin users, then creates the Standard, Superior, Deluxe, and Suite demo rooms plus a sample review. Every existing `ADMIN` account is retained. Restart without the environment variable afterwards so the reset does not run again.

Sample guest: `guest@forestview.vn` / `guest123`.
