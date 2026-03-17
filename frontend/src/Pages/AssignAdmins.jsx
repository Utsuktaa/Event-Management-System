import SuperAdminDashboard from "../Components/SuperAdminDashboard";

const AssignAdmins = () => {
  return (
    <div className="min-h-screen bg-purple-950 font-poppins text-white flex flex-col items-center py-12 px-4">
      <div className="flex items-center gap-4 mb-8 w-full max-w-6xl">
        <div className="h-1 flex-1 bg-blue-400" />
        <h1 className="font-pixel text-4xl uppercase tracking-wider">
          Assign Admins
        </h1>
        <div className="h-1 flex-1 bg-blue-400" />
      </div>

      <div className="w-full max-w-6xl mb-8">
        <SuperAdminDashboard />
      </div>
    </div>
  );
};

export default AssignAdmins;
