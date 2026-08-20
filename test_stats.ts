import { dashboardApi } from "./src/services-api/dashboardService";
const run = async () => {
    try {
        const stats = await dashboardApi.getStatistics("month");
        console.log(JSON.stringify(stats, null, 2));
    } catch (e) {
        console.error(e);
    }
}
run();
