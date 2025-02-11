import DocumentUpload from '../components/DocumentUpload';

const MortgageApplicationPage = () => {
  // You'll need to get the mortgage application ID somehow,
  // e.g., from a route parameter or from the application form.
  const mortgageApplicationId = 'your-mortgage-application-id'; // Replace with actual ID

  return (
    <div>
      <h1>Mortgage Application</h1>
      {/* ... other application form elements ... */}
      <DocumentUpload mortgageApplicationId={mortgageApplicationId} />
    </div>
  );
};

export default MortgageApplicationPage; 