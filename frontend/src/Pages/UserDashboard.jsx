import DashboardDesign from "../Components/DashboardDesign";
import PageLayout from "../Components/PageLayout";

export default function UserDashboard() {
  return (
    <PageLayout title="Dashboard" role="user">
      <DashboardDesign />
    </PageLayout>
  );
}
