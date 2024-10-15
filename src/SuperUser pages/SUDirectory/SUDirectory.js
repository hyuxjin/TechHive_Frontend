import React, { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Switch,
  Modal,
  Box,
  TextField,
} from '@mui/material';
import * as XLSX from 'xlsx';
import SUNavBar from "../../components/SUNavBar";
import './SUDirectory.css';

const SUDirectory = () => {
  const [category, setCategory] = useState('SuperUser');  // Default category
  const [statusFilter, setStatusFilter] = useState('All');
  const [tableData, setTableData] = useState([]);
  const [showForm, setShowForm] = useState(false);  // Toggle modal
  const [newAccount, setNewAccount] = useState({
    fullName: '',
    email: '',
    username: '',
    idNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [newOffice, setNewOffice] = useState({
    name: '',
    head: '',
    email: '',
    services: '',
  });

  // Fetch Admin Data
  const fetchAdminData = async () => {
    try {
      const response = await fetch('http://localhost:8080/admin/getAllAdmins');
      const data = await response.json();

      const formattedData = data.map(admin => ({
        name: admin.fullName,
        idNumber: admin.idNumber,
        email: admin.email,
        username: admin.adminname,
        status: admin.status,
      }));

      setTableData(formattedData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  // Fetch SuperUser Data
  const fetchSuperUserData = async () => {
    try {
      const response = await fetch('http://localhost:8080/superuser/getAllSuperUsers');
      const data = await response.json();

      const formattedData = data.map(superuser => ({
        name: superuser.fullName,
        idNumber: superuser.superUserIdNumber,
        email: superuser.email,
        username: superuser.superUsername,
        status: superuser.status,
      }));

      setTableData(formattedData);
    } catch (error) {
      console.error('Error fetching superuser data:', error);
    }
  };

  // Fetch Office Data
  const fetchOfficeData = async () => {
    try {
      const response = await fetch('http://localhost:8080/office/getAllOffices');
      if (!response.ok) {
        throw new Error('Failed to fetch office data');
      }
      const data = await response.json();
      const formattedData = data.map(office => ({
        id: office.id,
        name: office.name,
        head: office.head,
        email: office.email,
        services: office.services,
        status: office.status,
      }));

      setTableData(formattedData);
    } catch (error) {
      console.error('Error fetching office data:', error);
    }
  };

  useEffect(() => {
    if (category === 'Admin') {
      fetchAdminData();
    } else if (category === 'SuperUser') {
      fetchSuperUserData();
    } else if (category === 'Office') {
      fetchOfficeData();
    }
  }, [category]);

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  // Toggle status (enabled/disabled) for Admin, SuperUser, and Office
  const handleToggleStatus = async (index) => {
    const updatedData = [...tableData];
    const item = updatedData[index];
    const newStatus = !item.status;  // Toggle current status
  
    try {
      let endpoint = '';
      let requestBody = {};
  
      if (category === 'Admin') {
        endpoint = `http://localhost:8080/admin/updateStatus`;
        requestBody = {
          idNumber: item.idNumber,
          status: newStatus
        };
      } else if (category === 'SuperUser') {
        endpoint = `http://localhost:8080/superuser/updateStatus`;
        requestBody = {
          superUserIdNumber: item.idNumber,  // Use superUserIdNumber for SuperUser
          status: newStatus
        };
      } else if (category === 'Office') {
        endpoint = `http://localhost:8080/office/updateStatus/${item.id}`;
        requestBody = { 
          status: newStatus 
        };
      }
  
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),  // Send the ID and new status
      });
  
      if (response.ok) {
        updatedData[index].status = newStatus;  // Update the frontend state
        setTableData(updatedData);  // Update the table with the new status
      } else {
        console.error('Failed to update status on the backend.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };
  

  // Filter table data by status
  const filteredTableData = tableData.filter(row => {
    return statusFilter === 'All' || (statusFilter === 'Enabled' && row.status) || (statusFilter === 'Disabled' && !row.status);
  });

  // Handle form input change for Admin and SuperUser
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (category === 'Office') {
      setNewOffice({
        ...newOffice,
        [name]: value,
      });
    } else {
      setNewAccount({
        ...newAccount,
        [name]: value,
      });
    }
  };

  // Submit form to create a new Admin, SuperUser, or Office
  const handleSubmit = async () => {
    if (category !== 'Office' && newAccount.password !== newAccount.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    let newEntry;
    let endpoint = '';

    if (category === 'Admin') {
      newEntry = {
        fullName: newAccount.fullName,
        adminname: newAccount.username,
        email: newAccount.email,
        idNumber: newAccount.idNumber,
        password: newAccount.password,
        status: true,  // Enabled by default
      };
      endpoint = 'http://localhost:8080/admin/insertAdmin';
    } else if (category === 'SuperUser') {
      newEntry = {
        superUsername: newAccount.username,
        fullName: newAccount.fullName,
        email: newAccount.email,
        superUserIdNumber: newAccount.idNumber,
        superUserPassword: newAccount.password,
        status: true,  // Enabled by default
      };
      endpoint = 'http://localhost:8080/superuser/insertSuperUser';
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEntry),
      });

      if (response.ok) {
        const createdEntry = await response.json();
        setTableData([...tableData, createdEntry]);
        setShowForm(false);  // Close the modal
      } else {
        console.error(`Failed to create ${category} in the backend.`);
      }
    } catch (error) {
      console.error(`Error creating ${category}:`, error);
    }
  };

  // Submit form to create a new Office
  const handleOfficeSubmit = async () => {
    const officeToCreate = {
      name: newOffice.name,
      head: newOffice.head,
      email: newOffice.email,
      services: newOffice.services,
      status: true  // Enabled by default when created
    };

    try {
      const response = await fetch(`http://localhost:8080/office/addOffice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(officeToCreate),  // Send office data as JSON
      });

      if (response.ok) {
        const createdOffice = await response.json();  // Parse response

        // Add the newly created office to the table data
        const newOfficeRow = {
          name: createdOffice.name,
          head: createdOffice.head,
          email: createdOffice.email,
          services: createdOffice.services,
          status: createdOffice.status,
        };

        // Update the table to show the new office
        setTableData([...tableData, newOfficeRow]);
        
        // Close the modal after successful submission
        setShowForm(false);
      } else {
        console.error('Failed to create office in the backend.');
      }
    } catch (error) {
      console.error('Error creating office:', error);
    }
  };

  // Export data to Excel
  const exportToExcel = () => {
    const exportData = filteredTableData.map(row => {
      if (category === 'Office') {
        return {
          Office: row.name,
          Head: row.head,
          Email: row.email,
          Services: row.services,
          Status: row.status ? 'Enabled' : 'Disabled',
        };
      } else {
        return {
          Name: row.name,
          'ID Number': row.idNumber,
          Email: row.email,
          Username: row.username,
          Status: row.status ? 'Enabled' : 'Disabled',
        };
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${category} Data`);
    XLSX.writeFile(workbook, `${category}_data.xlsx`);
  };

  return (
    <div className="su-directory-container">
      <SUNavBar />

      <img src={`${process.env.PUBLIC_URL}/DIR.png`} alt="Directory Header" className="directory-header-image" />

      <div className="dropdown-container">
        <FormControl variant="outlined" className="dropdown">
          <InputLabel id="category-label">Category</InputLabel>
          <Select
            labelId="category-label"
            id="category-select"
            value={category}
            onChange={handleCategoryChange}
            label="Category"
          >
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="SuperUser">SuperUser</MenuItem>
            <MenuItem value="Office">Office</MenuItem>
          </Select>
        </FormControl>

        <FormControl variant="outlined" className="dropdown">
          <InputLabel id="status-label">Status</InputLabel>
          <Select
            labelId="status-label"
            id="status-select"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            label="Status"
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Enabled">Enabled</MenuItem>
            <MenuItem value="Disabled">Disabled</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="secondary"
          onClick={exportToExcel}
        >
          Download Excel
        </Button>

        <Button variant="contained" color="primary" onClick={() => setShowForm(true)}>
          {category === 'Office' ? 'Add an Office' : `Create a ${category} Account`}
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {category === 'Office' ? (
                <>
                  <TableCell>Office</TableCell>
                  <TableCell>Head</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Services</TableCell>
                  <TableCell>Status</TableCell>
                </>
              ) : (
                <>
                  <TableCell>Name</TableCell>
                  <TableCell>ID Number</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Status</TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTableData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No data available.
                </TableCell>
              </TableRow>
            ) : (
              filteredTableData.map((row, index) => (
                <TableRow key={index}>
                  {category === 'Office' ? (
                    <>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.head}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.services}</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.idNumber}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.username}</TableCell>
                    </>
                  )}
                  <TableCell>
                    <Switch
                      checked={row.status}
                      onChange={() => handleToggleStatus(index)}
                      color="primary"
                    />
                    {row.status ? 'Enabled' : 'Disabled'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Account/Office Creation Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        aria-labelledby="create-modal"
        aria-describedby="create-form"
      >
        <Box className="admin-form-modal">
          <h2>{category === 'Office' ? 'Add an Office' : `Create a ${category} Account`}</h2>
          {category === 'Office' ? (
            <>
              <TextField
                label="Office Name"
                name="name"
                variant="outlined"
                fullWidth
                margin="normal"
                onChange={handleInputChange}
              />
              <TextField
                label="Head"
                name="head"
                variant="outlined"
                fullWidth
                margin="normal"
                onChange={handleInputChange}
              />
              <TextField
                label="Email"
                name="email"
                variant="outlined"
                fullWidth
                margin="normal"
                onChange={handleInputChange}
              />
              <TextField
                label="Services"
                name="services"
                variant="outlined"
                fullWidth
                margin="normal"
                onChange={handleInputChange}
              />
            </>
          ) : (
            <>
              <TextField
                label="Full Name"
                name="fullName"
                variant="outlined"
                fullWidth
                margin="normal"
                onChange={handleInputChange}
              />
              <TextField
                label="Email"
                name="email"
                variant="outlined"
                fullWidth
                margin="normal"
                onChange={handleInputChange}
              />
              <TextField
                label="Username"
                name="username"
                variant="outlined"
                fullWidth
                margin="normal"
                onChange={handleInputChange}
              />
              <TextField
                label="ID Number"
                name="idNumber"
                variant="outlined"
                fullWidth
                margin="normal"
                onChange={handleInputChange}
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                onChange={handleInputChange}
              />
              <TextField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                onChange={handleInputChange}
              />
            </>
          )}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={category === 'Office' ? handleOfficeSubmit : handleSubmit}
          >
            {category === 'Office' ? 'Add Office' : `Create ${category}`}
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default SUDirectory;
