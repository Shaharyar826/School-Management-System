import UploadBase from '../../components/upload/UploadBase';

const AdminStaffUploadPage = () => {
  const instructions = [
    'Each admin staff must have a unique email address and employee ID.',
    'Required fields: First Name, Last Name, Email, Employee ID, Phone Number, Qualification, Experience, Position, Department, Gender, Salary.',
    'Gender must be one of: male, female, other.',
    'Role can be one of: admin, principal, vice-principal. Defaults to admin if not specified.',
    'Responsibilities should be comma-separated (e.g., "Budget Management,Staff Coordination").',
    'Date fields should be in YYYY-MM-DD format.',
    'Admin staff will be created with auto-generated passwords.',
    'Admin staff will be automatically approved and set to active status.'
  ];

  return (
    <UploadBase
      title="Bulk Upload Administrative Staff"
      description="Upload multiple administrative staff records at once using an Excel or CSV file."
      templateUrl="/api/upload/template/admin-staff"
      uploadUrl="/api/upload/admin-staff"
      instructions={instructions}
    />
  );
};

export default AdminStaffUploadPage;
