import {
  Container,
  Card,
  CardBody,
  CardTitle,
  ListGroup,
  ListGroupItem,
} from "reactstrap";
import "../../styles/index.css";

const Admin = () => {
  return (
    <Container className='admin-container py-5'>
      <Card className='shadow'>
        <CardBody>
          <CardTitle tag='h1' className='admin-header'>
            Admin Paneli
          </CardTitle>
          <CardBody>
            <ListGroup flush>
              <ListGroupItem className='admin-list-item'>
                <strong>Profil Sayfası:</strong> Çalışan bilgilerini
                görüntüleyebilir ve düzenleyebilirsiniz.
              </ListGroupItem>
              <ListGroupItem className='admin-list-item'>
                <strong>İş Takip Sayfası:</strong> Yeni işler ekleyebilir,
                mevcut işleri güncelleyebilir ve kapatabilirsiniz.
              </ListGroupItem>
            </ListGroup>
          </CardBody>
        </CardBody>
      </Card>
    </Container>
  );
};

export default Admin;
