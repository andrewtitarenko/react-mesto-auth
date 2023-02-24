import React, { useState, useEffect } from "react";
import { Route, Switch, Redirect, useHistory } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import Main from "./Main";
import ImagePopup from "./ImagePopup";
import api from "../utils/api";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import DeletePopup from "./DeletePopup";
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute";
import Register from "./Register";
import auth from "../utils/Auth";
import InfoTooltip from "./InfoTooltip";

function App() {
  const history = useHistory();
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isOpenConfirmPopup, setIsOpenConfirmPopup] = useState(false);
  const [isOpenInfoTooltip, setIsOpenInfoTooltip] = useState(false);
  const [selectedCard, setSelectedCard] = useState({});
  const [currentUser, setCurrentUser] = useState({});
  const [cards, setCards] = useState([]);
  const [card, setCard] = useState({});

  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [requestStatus, setRequestStatus] = useState(false);
  const [textInfoTooltip, setTextInfoTooltip] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      auth
        .getAuthenticationUser(token)
        .then((res) => {
          if (res) {
            setEmail(res.data.email);
            handleLogin();
          }
        })
        .catch((err) => console.log(err))
        .finally(() => history.push("/"));
    }
  }, [loggedIn, history, email]);

  function handleLogin() {
    setLoggedIn(true);
  }

  useEffect(() => {
    if (loggedIn === true) {
      api
        .getCards()
        .then((cardsData) => {
          setCards(cardsData);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [loggedIn]);

  useEffect(() => {
    if (loggedIn === true) {
      api
        .getUserInfo()
        .then((userData) => {
          setCurrentUser(userData);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [loggedIn]);

  useEffect(() => {
    const closeEscape = (evt) => {
      evt.key === "Escape" && closeAllPopups();
    };
    if (
      isAddPlacePopupOpen ||
      isEditAvatarPopupOpen ||
      isEditProfilePopupOpen ||
      selectedCard ||
      card
    ) {
      document.addEventListener("keydown", closeEscape);
    }
    return () => document.removeEventListener("keydown", closeEscape);
  });

  const handleLoginSubmit = (data) => {
    auth
      .setAuthorizeUser(data)
      .then((res) => {
        localStorage.setItem("token", res.token);
        handleLogin();
      })
      .then(() => history.push("/"))
      .catch((err) => {
        setRequestStatus(false);
        setTextInfoTooltip("Что-то пошло не так! Попробуйте ещё раз");
        handleInfotooltipPopupOpen();
        console.log(err);
      });
  };

  const handleRegistrationSubmit = (data) => {
    auth
      .setRegisterUser(data)
      .then((res) => {
        if (res) {
          setRequestStatus(true);
          setTextInfoTooltip("Вы успешно зарегистрировались!");
          handleInfotooltipPopupOpen();
        }
      })
      .then(() => {
        history.push("/sign-in");
      })
      .catch((err) => {
        console.log(err);
        setRequestStatus(false);
        setTextInfoTooltip("Что-то пошло не так! Попробуйте ещё раз");
        handleInfotooltipPopupOpen();
      });
  };

  function handleConfirmPopupOpen(card) {
    setIsOpenConfirmPopup(true);
    setCard(card);
  }

  function handleInfotooltipPopupOpen() {
    setIsOpenInfoTooltip(true);
  }

  function handleCardLike(card) {
    const isLiked = card.likes.some((i) => i._id === currentUser._id);
    api
      .changeLikeCardStatus(card._id, !isLiked)
      .then((newCard) => {
        setCards((state) =>
          state.map((c) => (c._id === card._id ? newCard : c))
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleCardDelete(card) {
    api
      .deleteCard(card._id)
      .then(() => {
        setCards(() => cards.filter((c) => c._id !== card._id));
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const handleEditAvatarClick = () => {
    setIsEditAvatarPopupOpen(true);
  };

  const handleEditProfileClick = () => {
    setIsEditProfilePopupOpen(true);
  };

  const handleAddPlaceClick = () => {
    setIsAddPlacePopupOpen(true);
  };
  const closeAllPopups = () => {
    setIsAddPlacePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setSelectedCard({});
    setCard({});
    setIsOpenConfirmPopup(false);
    setIsOpenInfoTooltip(false);
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const handleUpdateUser = (user) => {
    return api
      .editUserInfo(user)
      .then((userData) => {
        setCurrentUser(userData);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleUpdateAvatar = (userAvatar) => {
    return api
      .editAvatar(userAvatar)
      .then((userData) => {
        setCurrentUser(userData);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleAddPlaceSubmit = (card) => {
    return api
      .addNewCard(card)
      .then((newCard) => {
        setCards([newCard, ...cards]);
        closeAllPopups();
      })
      .catch((err) => console.log(err));
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
  };

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page">
        <Header emailUser={email} onSignOut={handleSignOut} />
        <Switch>
          <ProtectedRoute
            exact
            path="/"
            loggedIn={loggedIn}
            component={Main}
            onEditProfile={handleEditProfileClick}
            onAddPlace={handleAddPlaceClick}
            onEditAvatar={handleEditAvatarClick}
            onCardClick={handleCardClick}
            cards={cards}
            onCardLike={handleCardLike}
            onConfirmPopupOpen={handleConfirmPopupOpen}
          />
          <Route path="/sign-up">
            <Register onSubmit={handleRegistrationSubmit} />
          </Route>
          <Route path="/sign-in">
            <Login onSubmit={handleLoginSubmit} />
          </Route>
          <Route>
            {loggedIn ? <Redirect to="/" /> : <Redirect to="/sign-in" />}
          </Route>
        </Switch>
        <Footer />
      </div>

      <InfoTooltip
        onClose={closeAllPopups}
        isOpen={isOpenInfoTooltip}
        isRequestStatus={requestStatus}
        text={textInfoTooltip}
      />
      <EditProfilePopup
        isOpen={isEditProfilePopupOpen}
        onClose={closeAllPopups}
        onUpdateUser={handleUpdateUser}
      />

      <EditAvatarPopup
        isOpen={isEditAvatarPopupOpen}
        onClose={closeAllPopups}
        onUpdateAvatar={handleUpdateAvatar}
      />

      <AddPlacePopup
        isOpen={isAddPlacePopupOpen}
        onClose={closeAllPopups}
        onAddPlace={handleAddPlaceSubmit}
      />

      <ImagePopup card={selectedCard} onClose={closeAllPopups} />
      <DeletePopup
        card={card}
        isOpen={isOpenConfirmPopup}
        onDeleteCard={handleCardDelete}
        onClose={closeAllPopups}
      />
    </CurrentUserContext.Provider>
  );
}

export default App;
