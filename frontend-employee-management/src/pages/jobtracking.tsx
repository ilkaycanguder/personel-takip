import { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardBody,
  CardTitle,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
} from "reactstrap";
import { Job } from "../types";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import "../styles/index.css";

export const decodeJson = (key: string) => {
  const item = localStorage.getItem(key);
  if (item) {
    try {
      return JSON.parse(item);
    } catch (error) {
      console.error("JSON parse hatası:", error);
      return {};
    }
  }
  return {};
};

const user = decodeJson("user");
if (!user.id) {
  console.error("Kullanıcı ID'si mevcut değil.");
}

const JobTracking = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [modal, setModal] = useState(false);
  const [jobToUpdate, setJobToUpdate] = useState<Job | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    const user = decodeJson("user");
    if (user && user.id) {
      fetchJobs(user.id);
    } else {
      console.error("User is not defined or does not have an ID");
    }
  }, []);

  const fetchJobs = async (userId: number) => {
    try {
      const response = await fetch(
        `https://localhost:7074/api/Jobs?userId=${userId}`
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data: Job[] = await response.json();
      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const jobToUpdate = jobs.find((job) => job.id === id);
      if (!jobToUpdate) {
        throw new Error("Job not found");
      }
      if (jobToUpdate.status === "Done" && newStatus === "To Do") {
        console.error("Cannot change status from 'Done' to 'To Do'");
        return;
      }
      const updatedJob = { ...jobToUpdate, status: newStatus };

      const response = await fetch(`https://localhost:7074/api/Jobs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedJob),
      });

      if (!response.ok) {
        throw new Error("Failed to update job status");
      }

      setJobs(jobs.map((job) => (job.id === id ? updatedJob : job)));
      showAlert("İş değişikliği başarıyla gerçekleşti!", "success");
    } catch (error) {
      console.error("Error updating job status:", error);
      showAlert("İş değişikliği sırasında bir hata oluştu.", "danger");
    }
  };

  const showAlert = (message: string, type: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
    setTimeout(() => setAlertVisible(false), 5000);
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const draggedJob = jobs.find((job) => job.id.toString() === draggableId);

    if (draggedJob) {
      if (draggedJob.status !== destination.droppableId) {
        setJobToUpdate(draggedJob);
        setNewStatus(destination.droppableId);
        toggleModal();
      } else {
        const reorderedJobs = reorder(
          jobs,
          source.index,
          destination.index,
          source.droppableId
        );
        setJobs(reorderedJobs);
      }
    }
  };

  const reorder = (
    jobs: Job[],
    startIndex: number,
    endIndex: number,
    droppableId: string
  ) => {
    const updatedJobs = [...jobs];
    const [removed] = updatedJobs.splice(startIndex, 1);
    removed.status = droppableId;
    updatedJobs.splice(endIndex, 0, removed);
    return updatedJobs;
  };

  const toggleModal = () => setModal(!modal);

  const confirmStatusChange = () => {
    if (jobToUpdate) {
      handleStatusChange(jobToUpdate.id, newStatus);
    }
    toggleModal();
  };

  const getJobStyle = (status: string) => {
    switch (status) {
      case "Done":
        return { backgroundColor: "#e2f0e8", border: "1px solid #d4edda" }; // Light Green
      case "In Progress":
        return { backgroundColor: "#fff4e6", border: "1px solid #ffeeba" }; // Light Yellow
      case "To Do":
        return { backgroundColor: "#fbe9e7", border: "1px solid #f8d7da" }; // Light Red
      default:
        return { backgroundColor: "#ffffff", border: "1px solid #cccccc" }; // White
    }
  };

  return (
    <Container fluid className='mt-4'>
      <Card className='shadow-sm'>
        <CardBody>
          <CardTitle tag='h4' className='text-center mb-4'>
            İş Takip
          </CardTitle>
          {alertVisible && (
            <Alert
              color={alertMessage.includes("başarıyla") ? "success" : "danger"}
              toggle={() => setAlertVisible(false)}
            >
              {alertMessage}
            </Alert>
          )}
          <DragDropContext onDragEnd={onDragEnd}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {["To Do", "In Progress", "Done"].map((status) => (
                <Droppable droppableId={status} key={status}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className='column'
                      style={{
                        width: "30%",
                        padding: "10px",
                        backgroundColor: "#f7f7f7",
                        borderRadius: "4px",
                        margin: "0 10px",
                      }}
                    >
                      <h5>{status}</h5>
                      {jobs
                        .filter((job) => job.status === status)
                        .map((job, index) => (
                          <Draggable
                            key={job.id.toString()}
                            draggableId={job.id.toString()}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className='draggable-item'
                                style={{
                                  ...provided.draggableProps.style,
                                  ...getJobStyle(job.status),
                                  marginBottom: "8px",
                                  padding: "10px",
                                  borderRadius: "4px",
                                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
                                  border: "1px solid #ccc",
                                  cursor: "pointer",
                                }}
                              >
                                <strong>{job.title}</strong>
                                <p className='mb-0'>{job.description}</p>
                                <small className='text-muted'>
                                  {new Date(job.createdat).toLocaleDateString(
                                    "tr-TR"
                                  )}
                                </small>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        </CardBody>
      </Card>

      {/* Modal for confirmation */}
      <Modal isOpen={modal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>
          Durum Değişikliğini Onayla
        </ModalHeader>
        <ModalBody>
          Durumu "{newStatus}" olarak değiştirmek istediğinizden emin misiniz?
        </ModalBody>
        <ModalFooter className='modal-footer-custom'>
          <Button color='primary' onClick={confirmStatusChange}>
            Onayla
          </Button>
          <Button color='danger' onClick={toggleModal}>
            İptal
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default JobTracking;
