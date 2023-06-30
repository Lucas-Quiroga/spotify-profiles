import { useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from "react-bootstrap/Image";
import Offcanvas from "react-bootstrap/Offcanvas";
import ListGroup from "react-bootstrap/ListGroup";
import { FaStar } from "react-icons/fa";
import { BsPatchCheckFill } from "react-icons/bs";

import "../styles/DashboardView.css";

interface Tracks {
  id: string;
  name: string;
  preview_url: string;
  external_urls: {
    spotify: string;
  };
}

interface Albums {
  id: string;
  name: string;
  images: {
    url: string;
  }[];
  songs: Tracks[];
}

interface Artist {
  id: string;
  name: string;
  followers: {
    total: number;
  };
  genres: [string];
  type: string;
  images: {
    url: string;
  }[];
  popularity: number;
  bio?: string;
}

interface DashboardViewProps {
  artistInfo: {
    artistData: Artist[];
    artistDataTopTracks: Tracks[];
    artistAlbums: Albums[];
    loading: boolean;
  };
}

const DashboardView = ({ artistInfo }: DashboardViewProps) => {
  const [show, setShow] = useState(false);
  const [showSongsAlbums, setShowSongsAlbums] = useState<Albums | null>(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  function ViewSongsAlbum(id: string) {
    const selectedAlbum = artistInfo.artistAlbums.find(
      (album) => album.id === id
    );

    if (selectedAlbum) {
      setShowSongsAlbums(selectedAlbum);
      handleShow();
    }
  }

  if (artistInfo.artistData.length === 0) {
    return (
      <h1 style={{ color: "white", fontFamily: "sans-serif" }}>
        Search for your favorite artist or group
      </h1>
    );
  }

  return (
    <>
      {show && (
        <Offcanvas show={show} onHide={handleClose} placement="end">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>
              {showSongsAlbums?.name.toLocaleUpperCase()}
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <ListGroup>
              {showSongsAlbums?.songs.map((song, index) => (
                <ListGroup.Item key={song.id}>
                  <Row className="mx-auto justify-content-center align-items-center">
                    <Col xs={1}>{index + 1}</Col>
                    <Col xs={11}>{song.name}</Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Offcanvas.Body>
        </Offcanvas>
      )}
      <Container className="dashboard-container">
        <Row>
          <Col xs={12} md={12} lg={12}>
            {artistInfo.artistData.map((e) => (
              <div key={e.id}>
                {e.followers.total > 100000 ? (
                  <div className="d-flex gap-3 m-0 pt-1 mx-auto justify-content-center text-center align-items-center">
                    <BsPatchCheckFill
                      style={{
                        color: "skyblue",
                        fontSize: "1.5rem",
                        background: "none",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "1.5rem",
                        fontFamily: "sans-serif",
                      }}
                    >
                      Verified Artist
                    </span>
                  </div>
                ) : (
                  ""
                )}
              </div>
            ))}
          </Col>
        </Row>

        <Row style={{ padding: 5 }}>
          <Col
            xs={12}
            md={12}
            lg={12}
            xl={4}
            className="dashboard-card d-flex flex-column justify-content-center align-items-center "
            style={{ padding: 1 }}
          >
            {artistInfo.artistData.map((e) => (
              <div className="image-container" key={e.id}>
                <Image src={e.images[0].url} alt="IMG-ARTIST" thumbnail fluid />
              </div>
            ))}
          </Col>

          <Col
            xs={12}
            md={12}
            lg={12}
            xl={8}
            className="dashboard-card d-flex flex-column mx-auto h-100"
            style={{ background: "black" }}
          >
            <Row
              style={{
                background: "black",
                position: "relative",
                height: "14rem",
              }}
            >
              <Col className="dashboard-card d-flex flex-column justify-content-center align-items-center text-center">
                <FaStar style={{ color: "yellow", fontSize: "1.5rem" }} />
                {artistInfo.artistData.map((e) => (
                  <h6 key={e.id}>{e.type.toLocaleUpperCase()}</h6>
                ))}
                {artistInfo.artistData.map((e) => (
                  <h1 key={e.id}>{e.name.toLocaleUpperCase()}</h1>
                ))}
              </Col>
              <Col className="dashboard-card d-flex flex-column justify-content-center align-items-center">
                <>
                  <h6>POPULARITY IN THE WORLD</h6>
                  {artistInfo.artistData.map((e) => (
                    <h4 key={e.id} style={{ textDecorationLine: "underline" }}>
                      {e.popularity}
                    </h4>
                  ))}
                  <div className="text-center">
                    <hr />
                    <h6>GENRE</h6>
                    {artistInfo.artistData.map((e) => (
                      <span key={e.id} style={{ fontFamily: "inherit" }}>
                        {e.genres.slice(0, 2).join(" - ")}
                      </span>
                    ))}
                  </div>
                </>
              </Col>
            </Row>
            <Row>
              <Col
                className="dashboard-card d-flex flex-column justify-content-center align-items-center p-3"
                xs={12}
                md={12}
                lg={6}
                xl={6}
              >
                <Container className="d-flex justify-content-center align-items-center mx-auto gap-4 flex-wrap albums-container">
                  {artistInfo.artistAlbums.map((e) => (
                    <div className="image-container zoom" key={e.id}>
                      <a
                        style={{ cursor: "pointer" }}
                        onClick={() => ViewSongsAlbum(e.id)}
                      >
                        <Image
                          src={e.images[0].url}
                          width={110}
                          className="albums-container"
                        />
                      </a>
                    </div>
                  ))}
                </Container>
              </Col>
              <Col
                className="dashboard-card d-flex flex-column justify-content-center align-items-center pt-2"
                xs={12}
                md={12}
                lg={6}
                xl={6}
              >
                <h6>POPULAR SONGS</h6>
                <div style={{ fontSize: 15, textAlign: "justify" }}>
                  {artistInfo.artistDataTopTracks.map((e) => (
                    <div key={e.id} className="zoom p-2">
                      <a
                        href={e.external_urls.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "inherit", textDecoration: "none" }}
                      >
                        {e.name}
                      </a>
                    </div>
                  ))}
                </div>
              </Col>
            </Row>
          </Col>
          <hr />
          <Row className="mx-auto">
            <Col xs={12} md={12} lg={12}>
              {artistInfo.artistData.map((e) => (
                <div key={e.id} className="text-center">
                  <p> {e.bio}</p>
                </div>
              ))}
            </Col>
          </Row>
        </Row>
      </Container>
    </>
  );
};

export default DashboardView;
