import { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Spinner from "react-bootstrap/Spinner";
import { Button } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import spotify from "./assets/spotify.png";
import DashboardView from "./components/DashboardView";
import "./App.css";

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

const api = "https://api.spotify.com";
const apiBio = "http://ws.audioscrobbler.com";

function App() {
  const [accessToken, setAccessToken] = useState("");
  const [inputText, setInputText] = useState("");

  const [artistInfo, setArtistInfo] = useState<{
    artistData: Artist[];
    artistDataTopTracks: Tracks[];
    artistAlbums: Albums[];
    loading: boolean;
  }>({
    artistData: [],
    artistDataTopTracks: [],
    artistAlbums: [],
    loading: false,
  });

  useEffect(() => {
    async function fetchAccessToken() {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `grant_type=client_credentials&client_id=${process.env.VITE_CLIENT_ID}&client_secret=${process.env.VITE_CLIENT_SECRET}`,
      });

      const data = await response.json();
      setAccessToken(data.access_token);
    }
    fetchAccessToken();
  }, []);

  async function searchArtist(): Promise<Artist | null> {
    try {
      const response = await fetch(
        `${api}/v1/search?q=${inputText}&type=artist`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      const artists: Artist[] = data.artists.items;

      return artists.length > 0 ? artists[0] : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async function getApi() {
    setArtistInfo((prevInfo) => ({ ...prevInfo, loading: true }));
    const artist = await searchArtist();
    if (artist) {
      try {
        const responses = await fetch(`${api}/v1/artists/${artist.id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await responses.json();

        const topTracksResponse = await fetch(
          `${api}/v1/artists/${artist.id}/top-tracks?country=AR`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const topTracksData = await topTracksResponse.json();
        const topTracks = topTracksData.tracks.slice(0, 5);

        const artistAlbumsResponse = await fetch(
          `${api}/v1/artists/${artist.id}/albums`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const artistAlbumsData = await artistAlbumsResponse.json();
        const topAlbums = artistAlbumsData.items.slice(0, 4);

        const albumsWithSongs: Albums[] = [];

        for (const album of topAlbums) {
          const albumsReponsonse = await fetch(
            `${api}/v1/albums/${album.id}/tracks`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          const albumData = await albumsReponsonse.json();
          album.songs = albumData.items;
          albumsWithSongs.push(album);
        }

        const artistContent = await getApiBio();

        setTimeout(() => {
          if (artistContent) {
            setArtistInfo({
              artistData: [
                { ...data, popularity: data.popularity, bio: artistContent },
              ],
              artistDataTopTracks: topTracks,
              artistAlbums: albumsWithSongs,
              loading: false,
            });
          } else {
            setArtistInfo({
              artistData: [{ ...data, popularity: data.popularity }],
              artistDataTopTracks: topTracks,
              artistAlbums: albumsWithSongs,
              loading: false,
            });
          }
        }, 1500);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  }

  async function getApiBio() {
    try {
      const responseBio = await fetch(
        `${apiBio}/2.0/?method=artist.getinfo&artist=${inputText}&api_key=${process.env.VITE_API_KEY}&format=json`,
        {
          method: "GET",
        }
      );

      const dataBio = await responseBio.json();
      const artistContent = dataBio.artist.bio.summary.replace(
        /<a\b[^>]*>(.*?)<\/a>/gi,
        ""
      );

      return artistContent;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  return (
    <Container className="flex-column d-flex justify-content-center">
      <div className="d-flex gap-3 mt-3 mb-3 p-0">
        <img src={spotify} alt="spotify-icon" width={50} />
        <h1 style={{ color: "white" }}>Spotify Profiles</h1>
      </div>
      <InputGroup size="sm" className="mb-3">
        <Form.Control
          placeholder="Search artist"
          aria-label="Small"
          aria-describedby="inputGroup-sizing-sm"
          onChange={(e) => setInputText(e.target.value)}
          onKeyDownCapture={(e) => {
            if (e.code === "Enter") {
              getApi();
            }
          }}
        />
        <Button onClick={getApi} variant="success">
          <FaSearch />
        </Button>
      </InputGroup>
      {artistInfo.loading ? (
        <Container className="d-flex mx-auto justify-content-center align-items-center p-relative mt-3">
          <Spinner animation="border" role="status" variant="light">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Container>
      ) : artistInfo.artistData.length === 0 ? (
        <h4
          className="text-center"
          style={{ color: "white", fontFamily: "sans-serif" }}
        >
          Search for your favorite artist or group
        </h4>
      ) : (
        <Container className="d-flex mx-auto justify-content-center align-items-center p-relative mt-3 dashboard_app">
          <DashboardView artistInfo={artistInfo} />
        </Container>
      )}
    </Container>
  );
}

export default App;
