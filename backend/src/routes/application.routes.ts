import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

// Mock applications data
const applications = [
  {
    id: 1,
    userId: 1,
    name: "John Doe",
    email: "john@example.com",
    status: "approved",
    amount: 250000,
    propertyAddress: "123 Main St, City, State",
    propertyType: "Single Family",
    creditScore: 750,
    income: 120000,
    employmentStatus: "Employed",
    submittedAt: "2024-02-13",
    documents: ["proof_of_income.pdf", "bank_statements.pdf"],
    propertyDetails: {
      price: 300000,
      type: "Single Family",
      address: "123 Main St",
      city: "Sample City",
      state: "CA",
      zip: "12345"
    },
    incomeEmployment: {
      employer: "Tech Corp",
      position: "Software Engineer",
      yearsEmployed: 3,
      annualIncome: 120000,
      otherIncome: 10000
    },
    assetsLiabilities: {
      bankBalance: 50000,
      investments: 100000,
      carLoans: 15000,
      creditCardDebt: 5000
    }
  }
];

// Get all applications
router.get('/', (req: Request, res: Response) => {
  res.json(applications);
});

// Get application by ID
router.get('/:id', (req: Request, res: Response) => {
  const application = applications.find(app => app.id === parseInt(req.params.id));
  if (!application) {
    return res.status(404).json({ message: 'Application not found' });
  }
  res.json(application);
});

// Create new application
router.post('/', (req: Request, res: Response) => {
  const newApplication = {
    id: applications.length + 1,
    userId: 1, // In production, get from authenticated user
    ...req.body,
    status: 'pending',
    submittedAt: new Date().toISOString().split('T')[0]
  };
  applications.push(newApplication);
  res.status(201).json(newApplication);
});

// Update application
router.put('/:id', (req: Request, res: Response) => {
  const index = applications.findIndex(app => app.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Application not found' });
  }
  
  applications[index] = {
    ...applications[index],
    ...req.body,
    id: applications[index].id, // Prevent ID from being changed
    userId: applications[index].userId // Prevent userId from being changed
  };
  
  res.json(applications[index]);
});

// Update application status
router.patch('/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  const application = applications.find(app => app.id === parseInt(req.params.id));
  
  if (!application) {
    return res.status(404).json({ message: 'Application not found' });
  }
  
  application.status = status;
  res.json(application);
});

export default router;
