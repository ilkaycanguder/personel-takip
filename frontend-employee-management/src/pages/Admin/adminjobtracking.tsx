import { useEffect, useState } from "react";
import {
  Container,
  Card,
  CardBody,
  CardTitle,
  Table,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Pagination,
  PaginationItem,
  PaginationLink,
  Alert,
} from "reactstrap";
import axios from "axios";
import { Job, User } from "../../types";
import "../../api/api";
import "../../styles/index.css";
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const API_BASE_URL = "https://localhost:7074/api";

const AdminJobTracking = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roleName, setRoleName] = useState<string>("");
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    status: "To Do",
    category: "",
    assignedto: 0,
    createdby: 0,
  });
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editConfirmModal, setEditConfirmModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<number | null>(null);
  const [updatedJobs, setUpdatedJobs] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(9);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const savedJobs = localStorage.getItem("jobs");
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.role === "Admin") {
        setRoleName("Admin");
      } else if (user.role === "Employee") {
        setRoleName("Employee");
      }
    }
    if (savedJobs) {
      try {
        const jobsData = JSON.parse(savedJobs);
        if (Array.isArray(jobsData)) {
          setJobs(jobsData);
        } else {
          console.error("Unexpected data format in localStorage:", jobsData);
        }
      } catch (error) {
        console.error("Error parsing jobs from localStorage:", error);
      }
    } else {
      fetchJobs(); // Veriler localStorage'da yoksa API'dan al
    }
    fetchUsers();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Jobs/all`);
      if (Array.isArray(response.data)) {
        setJobs(response.data);
        localStorage.setItem("jobs", JSON.stringify(response.data));
      } else {
        console.error("Unexpected response data:", response.data);
      }
    } catch (error) {
      console.error("Error fetching jobs", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Users`);
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        console.error("Unexpected response data:", response.data);
      }
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  const updateLocalStorageJobs = (updatedJobs: Job[]) => {
    localStorage.setItem("jobs", JSON.stringify(updatedJobs));
  };

  const handleAddJob = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const response = await axios.post(`${API_BASE_URL}/Jobs`, newJob);
        const addedJob = response.data;
        setJobs((prevJobs) => [...prevJobs, addedJob]);
        localStorage.setItem("jobs", JSON.stringify([...jobs, addedJob]));
        setNewJob({
          title: "",
          description: "",
          status: "To Do",
          category: "",
          assignedto: 0,
          createdby: 0,
        });
        setShowAddModal(false);
        setAlertMessage("İş başarıyla eklendi!");
        setAlertVisible(true);
        setTimeout(() => setAlertVisible(false), 5000);
      } catch (error) {
        console.error("Error adding job", error);
      }
    }
  };
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const getUserId = () => {
    return user.id ? Number(user.id) : 0;
  };
  // Form gönderildiğinde mevcut işi günceller
  const handleEditJob = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEditConfirmModal(true);
  };

  const confirmEditJob = async () => {
    if (editJob) {
      try {
        const userId = getUserId();
        console.log("User ID:", userId);

        await axios.put(
          `${API_BASE_URL}/Jobs/${editJob.id}?userId=${getUserId()}`,
          editJob
        );

        const response = await axios.get(`${API_BASE_URL}/Jobs/${editJob.id}`);
        const updatedJob = response.data;
        const updatedJobs = jobs.map((job) =>
          job.id === editJob.id ? updatedJob : job
        );
        updateLocalStorageJobs(updatedJobs);

        setJobs(updatedJobs);
        setUpdatedJobs((prev) => [...prev, editJob.id]);

        setEditJob(null);
        setEditConfirmModal(false);
        setAlertMessage("İş başarıyla güncellendi!");
        setAlertVisible(true);
        setTimeout(() => setAlertVisible(false), 5000);
      } catch (error) {
        console.error("Error updating job", error);
      }
    }
  };

  // İş silme işlemi
  const handleDeleteJob = async (id: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/Jobs/${id}`);
      const updatedJobs = jobs.filter((job) => job.id !== id);

      setJobs(updatedJobs);

      localStorage.setItem("jobs", JSON.stringify(updatedJobs));
      setDeleteModal(false);
      setAlertMessage("İş başarıyla silindi!");
      setAlertVisible(true);
      setTimeout(() => setAlertVisible(false), 5000);
    } catch (error) {
      console.error("Error deleting job", error);
    }
  };

  const confirmDelete = (id: number) => {
    setJobToDelete(id);
    setDeleteModal(true);
  };

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

  const totalPages = Math.ceil(jobs.length / jobsPerPage);
  const handleAlertDismiss = () => setAlertVisible(false);

  return (
    <Container fluid>
      <Card className='shadow-sm'>
        <CardBody>
          <CardTitle tag='h5' className='text-center mb-4'>
            İş Takip (Admin)
          </CardTitle>
          {/* Success Alert */}
          {alertVisible && (
            <Alert color='success' toggle={handleAlertDismiss}>
              {alertMessage}
            </Alert>
          )}
          <Button
            color='success'
            className='me-2 btn-custom btn-add'
            onClick={() => setShowAddModal(true)}
          >
            Yeni İş Ekle
          </Button>
          <Table hover responsive className='table'>
            <thead>
              <tr>
                <th>Başlık</th>
                <th>Açıklama</th>
                <th>Durum</th>
                <th>Kategori</th>
                <th>Atanan</th>
                <th>Oluşturan</th>
                <th>Güncelleme Tarihi</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {currentJobs.map((job) => (
                <tr
                  key={job.id}
                  className={updatedJobs.includes(job.id) ? "updated-job" : ""}
                >
                  <td>{job.title}</td>
                  <td>{job.description}</td>
                  <td>{job.status}</td>
                  <td>{job.category}</td>
                  <td>
                    {users.find((u) => u.id === job.assignedto)?.firstname}{" "}
                    {users.find((u) => u.id === job.assignedto)?.lastname}
                  </td>
                  <td>{roleName}</td>
                  <td>
                    {new Date(job.updatedat).toLocaleDateString("tr-TR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                    ,
                    {new Date(job.updatedat).toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>

                  <td className='d-flex gap-2'>
                    <Button
                      onClick={() => setEditJob(job)}
                      className='me-2 btn-custom btn-edit'
                    >
                      Düzenle
                    </Button>
                    <Button
                      className='me-2 btn-custom btn-delete'
                      onClick={() => confirmDelete(job.id)}
                    >
                      Sil
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Modal isOpen={showAddModal} toggle={() => setShowAddModal(false)}>
            <ModalHeader toggle={() => setShowAddModal(false)}>
              Yeni İş Ekle
            </ModalHeader>
            <Form onSubmit={handleAddJob}>
              <ModalBody>
                <FormGroup>
                  <Label for='title'>Başlık</Label>
                  <Input
                    id='title'
                    value={newJob.title}
                    placeholder='İş için bir başlık girin'
                    onChange={(e) =>
                      setNewJob({ ...newJob, title: e.target.value })
                    }
                  />
                </FormGroup>
                <FormGroup>
                  <Label for='description'>Açıklama</Label>
                  <Input
                    id='description'
                    value={newJob.description}
                    placeholder='İş için bir açıklama giriniz'
                    onChange={(e) =>
                      setNewJob({ ...newJob, description: e.target.value })
                    }
                  />
                </FormGroup>
                <FormGroup>
                  <Label for='status'>Durum</Label>
                  <Input
                    id='status'
                    type='select'
                    value={newJob.status}
                    onChange={(e) =>
                      setNewJob({ ...newJob, status: e.target.value })
                    }
                  >
                    <option>To Do</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label for='category'>Kategori</Label>
                  <Input
                    id='category'
                    value={newJob.category}
                    placeholder='İş için bir kategori giriniz'
                    onChange={(e) =>
                      setNewJob({ ...newJob, category: e.target.value })
                    }
                  />
                </FormGroup>
                <FormGroup>
                  <Label for='assignedto'>Atanan Kişi</Label>
                  <Input
                    id='assignedto'
                    type='select'
                    value={newJob.assignedto}
                    onChange={(e) =>
                      setNewJob({
                        ...newJob,
                        assignedto: Number(e.target.value),
                      })
                    }
                  >
                    <option value='0'>Seçin</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstname} {user.lastname}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </ModalBody>
              <ModalFooter className='modal-footer-custom'>
                <Button color='primary' type='submit'>
                  Ekle
                </Button>{" "}
                <Button color='danger' onClick={() => setShowAddModal(false)}>
                  İptal
                </Button>
              </ModalFooter>
            </Form>
          </Modal>
          {editJob && (
            <>
              <Modal isOpen={!!editJob} toggle={() => setEditJob(null)}>
                <ModalHeader toggle={() => setEditJob(null)}>
                  İş Düzenle
                </ModalHeader>
                <Form onSubmit={handleEditJob}>
                  <ModalBody>
                    <FormGroup>
                      <Label for='title'>Başlık</Label>
                      <Input
                        type='text'
                        id='title'
                        placeholder='İşin başlığı'
                        value={editJob.title}
                        onChange={(e) =>
                          setEditJob({ ...editJob, title: e.target.value })
                        }
                        required
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label for='description'>Açıklama</Label>
                      <Input
                        type='textarea'
                        id='description'
                        placeholder='İşin açıklaması'
                        value={editJob.description}
                        onChange={(e) =>
                          setEditJob({
                            ...editJob,
                            description: e.target.value,
                          })
                        }
                        required
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label for='status'>Durum</Label>
                      <Input
                        type='select'
                        id='status'
                        value={editJob.status}
                        onChange={(e) =>
                          setEditJob({ ...editJob, status: e.target.value })
                        }
                        required
                      >
                        <option>To Do</option>
                        <option>In Progress</option>
                        <option>Done</option>
                      </Input>
                    </FormGroup>
                    <FormGroup>
                      <Label for='category'>Kategori</Label>
                      <Input
                        type='text'
                        id='category'
                        placeholder='İşin kategorisi'
                        value={editJob.category}
                        onChange={(e) =>
                          setEditJob({ ...editJob, category: e.target.value })
                        }
                        required
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label for='assignedto'>Atanan Kullanıcı</Label>
                      <Input
                        type='select'
                        id='assignedto'
                        value={editJob.assignedto}
                        onChange={(e) =>
                          setEditJob({
                            ...editJob,
                            assignedto: Number(e.target.value),
                          })
                        }
                        required
                      >
                        <option value='0'>Atanmadı</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.firstname} {user.lastname}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </ModalBody>
                  <ModalFooter className='modal-footer-custom'>
                    <Button color='primary' onClick={confirmEditJob}>
                      Onayla
                    </Button>
                    <Button color='danger' onClick={() => setEditJob(null)}>
                      İptal
                    </Button>
                  </ModalFooter>
                </Form>
              </Modal>
            </>
          )}
        </CardBody>
      </Card>
      <Modal isOpen={deleteModal} toggle={() => setDeleteModal(!deleteModal)}>
        <ModalHeader toggle={() => setDeleteModal(!deleteModal)}>
          İşi Sil
        </ModalHeader>
        <ModalBody>Bu işi silmek istediğinizden emin misiniz?</ModalBody>
        <ModalFooter className='modal-footer-custom'>
          <Button color='primary' onClick={() => handleDeleteJob(jobToDelete!)}>
            Evet
          </Button>
          <Button color='danger' onClick={() => setDeleteModal(false)}>
            İptal
          </Button>
        </ModalFooter>
      </Modal>
      {/* Pagination Component */}
      <div className='pagination-container'>
        <Pagination>
          <PaginationItem disabled={currentPage === 1}>
            <PaginationLink
              previous
              href='#'
              onClick={() => setCurrentPage(currentPage - 1)}
            />
          </PaginationItem>
          {[...Array(totalPages)].map((_, index) => (
            <PaginationItem active={currentPage === index + 1} key={index}>
              <PaginationLink
                href='#'
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem disabled={currentPage === totalPages}>
            <PaginationLink
              next
              href='#'
              onClick={() => setCurrentPage(currentPage + 1)}
            />
          </PaginationItem>
        </Pagination>
      </div>
    </Container>
  );
};

export default AdminJobTracking;
