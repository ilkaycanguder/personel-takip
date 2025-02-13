import {
  Container,
  Card,
  CardBody,
  CardTitle,
  ListGroup,
  ListGroupItem,
} from "reactstrap";
import "../styles/index.css";

const Employee = () => {
  return (
    <Container className='employee-container mt-4'>
      <Card className='shadow mt-4'>
        <CardBody>
          <CardTitle tag='h2' className='employee-header'>
            Personel Bilgi Sayfası
          </CardTitle>
          <ListGroup flush>
            <ListGroupItem className='employee-info-item'>
              <strong>Profil Sayfası:</strong> Kişisel bilgilerinizi
              görüntüleyebilir ve düzenleyebilirsiniz.
              <p>
                Burada, adınızı, soyadınızı, e-posta adresinizi ve biriminizi
                görebilirsiniz. Ayrıca, şifrenizi güncelleme seçeneğiniz de
                bulunur.
              </p>
            </ListGroupItem>
            <ListGroupItem className='employee-info-item'>
              <strong>İş Takip Sayfası:</strong> Yönetici tarafından oluşturulan
              işleri görüntüleyebilir ve takip edebilirsiniz.
              <p>
                İşler, çalıştığınız birime göre listelenir.
                (Backend/Frontend/Test/Designer) Buradan yapacağınız işi
                seçebilir ve işi tamamladığınızda bu durumu
                güncelleyebilirsiniz.
              </p>
            </ListGroupItem>
          </ListGroup>
        </CardBody>
      </Card>
    </Container>
  );
};

export default Employee;
