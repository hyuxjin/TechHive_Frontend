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

  const fetchCommentData = async () => {
    try {
      const response = await fetch('http://localhost:8080/comments'); // Adjust based on your API
      const data = await response.json();

      const formattedData = data.map(comment => ({
        commentId: comment.commentId,
        name: comment.fullName,
        postId: comment.postId,
        timestamp: comment.timestamp,
        content: comment.content,
        visible: comment.visible
      }));

      setTableData(formattedData);
    } catch (error) {
      console.error('Error fetching comment data:', error);
    }
  };
  
  const fetchPostData = async () => {
    try {
      const response = await fetch('http://localhost:8080/posts');
      const data = await response.json();

      const formattedData = data.map(post => ({
        postId: post.postId,
        name: post.fullName,
        idNumber: post.idNumber,
        datePosted: post.timestamp,
        content: post.content,
        visible: post.visible
      }));

      setTableData(formattedData);
    } catch (error) {
      console.error('Error fetching post data:', error);
    }
  };


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
    } else if (category === 'Post') {
      fetchPostData();
    } else if (category === 'Comment') {
      fetchCommentData();
    }
  }, [category]);

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleVisibilityFilterChange = (event) => {
    setStatusFilter(event.target.value);
  }

  // Toggle status (enabled/disabled) for Admin, SuperUser, and Office
  const handleToggleStatus = async (index) => {
    const updatedData = [...tableData];
    const item = updatedData[index];
    const newStatus = !item.status;  // Toggle current status or visibility
    const newVisibility = !item.visible;
    
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
          superUserIdNumber: item.idNumber,
          status: newStatus
        };
      } else if (category === 'Office') {
        endpoint = `http://localhost:8080/office/updateStatus/${item.id}`;
        requestBody = { 
          status: newStatus 
        };
      } else if (category === 'Post') {
        endpoint = `http://localhost:8080/posts/${item.postId}/visibility`; // Post-specific endpoint
        requestBody = {
          visible: newVisibility // Updating visibility for Post
        };
      } else if (category === 'Comment') {
        endpoint = `http://localhost:8080/comments/${item.commentId}/visibility`;
        requestBody = {
          visible: newVisibility
        } 
      }
  
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      if (response.ok) {
        updatedData[index].status = newStatus;  // Update the frontend state
        updatedData[index].visible = newVisibility;
        setTableData(updatedData);  // Update the table with the new status/visibility
      } else {
        console.error('Failed to update status on the backend.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };
  
  const handleToggleVisibility = async (index) => {
    const updatedData = [...tableData];
    const item = updatedData[index];
    const newVisibility = !item.visible;  // Toggle current visibility
  
    try {
      const endpoint = `http://localhost:8080/comments/${item.commentId}/visibility`;
      const requestBody = {
        visible: newVisibility // Set the new visibility
      };
  
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      if (response.ok) {
        updatedData[index].visible = newVisibility;  // Update visibility in the frontend
        setTableData(updatedData);  // Update the table with the new visibility
      } else {
        console.error('Failed to update visibility on the backend.');
      }
    } catch (error) {
      console.error('Error updating visibility:', error);
    }
  };
  

  // Filter table data by status
  const filteredTableData = tableData.filter(row => {
    if (category === 'Post' || category === 'Comment') {
      if (statusFilter === 'Visible') {
        return row.visible === true;
      } else if (statusFilter === 'Hidden') {
        return row.visible === false;
      }
    } else {
      if (statusFilter === 'Enabled') {
        return row.status === true;
      } else if (statusFilter === 'Disabled') {
        return row.status === false;
      }
    }
    return true;  // Show all data when 'All' is selected
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
            <MenuItem value="Post">Post</MenuItem>
            <MenuItem value="Comment">Comment</MenuItem>
          </Select>
        </FormControl>
  
        {/* Conditionally hide the "Status" dropdown for "Comment" */}
        {category !== 'Comment' || category === 'Post' && (
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
        )}
  
        {/* Conditionally hide "Create a Comment Account" button for "Comment" */}
        {category !== 'Comment' || category === 'Post' && (
          <Button variant="contained" color="primary" onClick={() => setShowForm(true)}>
            {category === 'Office' ? 'Add an Office' : `Create a ${category} Account`}
          </Button>
        )}

         {/* Render Status dropdown when category is Admin, SuperUser, or Office */}
  {(category === 'Admin' || category === 'SuperUser' || category === 'Office') && (
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
  )}

        {/* Render Visibility dropdown when category is "Comment" or "Post" */}
{(category === 'Comment' || category === 'Post') && (
  <FormControl variant="outlined" className="dropdown">
    <InputLabel id="visibility-label">Visibility</InputLabel>
    <Select
      labelId="visibility-label"
      id="visibility-select"
      value={statusFilter}
      onChange={handleStatusFilterChange}
      label="Visibility"
    >
      <MenuItem value="All">All</MenuItem>
      <MenuItem value="Visible">Visible</MenuItem>
      <MenuItem value="Hidden">Hidden</MenuItem>
    </Select>
  </FormControl>
)}

  
        <Button variant="contained" color="secondary" onClick={exportToExcel}>
          Download Excel
        </Button>
      
       {/* Render Create Account/Office buttons only for Admin, SuperUser, and Office */}
  {(category === 'Admin' || category === 'SuperUser' || category === 'Office') && (
    <Button variant="contained" color="primary" onClick={() => setShowForm(true)}>
      {category === 'Office' ? 'Add an Office' : `Create a ${category} Account`}
    </Button>
  )}
</div>
  
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {/* Conditionally render columns based on category */}
              {category === 'Comment' ? (
                <>
                  <TableCell>Name</TableCell>
                  <TableCell>Comment ID</TableCell>
                  <TableCell>Date Commented</TableCell>
                  <TableCell>Comment</TableCell>
                  <TableCell>Visibility</TableCell>
                </>
              ) : category === 'Office' ? (
                <>
                  <TableCell>Office</TableCell>
                  <TableCell>Head</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Services</TableCell>
                  <TableCell>Status</TableCell>
                </>
              ) : category === 'Post' ? (
                <>
                  <TableCell>Name (Post Owner)</TableCell>
                  <TableCell>ID Number (Post Owner)</TableCell>
                  <TableCell>Date Posted</TableCell>
                  <TableCell>Content</TableCell>
                  <TableCell>Visibility Status</TableCell>
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
                  {category === 'Comment' ? (
                    <>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.commentId}</TableCell>
                      <TableCell>{row.timestamp}</TableCell>
                      <TableCell>{row.content}</TableCell>
                      <TableCell>
                        <Switch
                          checked={row.visible}
                          onChange={() => handleToggleVisibility(index)}
                          color="primary"
                        />
                        {row.visible ? 'Visible' : 'Hidden'}
                      </TableCell>
                    </>
                  ) : category === 'Office' ? (
                    <>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.head}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.services}</TableCell>
                      <TableCell>
                        <Switch
                          checked={row.status}
                          onChange={() => handleToggleStatus(index)}
                          color="primary"
                        />
                        {row.status ? 'Enabled' : 'Disabled'}
                      </TableCell>
                    </>
                  ) : category === 'Post' ? (
                    <>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.idNumber}</TableCell>
                      <TableCell>{row.datePosted}</TableCell>
                      <TableCell>{row.content}</TableCell>
                      <TableCell>
                        <Switch
                          checked={row.visible}
                          onChange={() => handleToggleStatus(index)}
                          color="primary"
                        />
                        {row.visible ? 'Visible' : 'Hidden'}
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.idNumber}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.username}</TableCell>
                      <TableCell>
                        <Switch
                          checked={row.status}
                          onChange={() => handleToggleStatus(index)}
                          color="primary"
                        />
                        {row.status ? 'Enabled' : 'Disabled'}
                      </TableCell>
                    </>
                  )}
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
