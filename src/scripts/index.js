import {
  addCard,
  addLike,
  deleteCard,
  getCardList,
  getUserInfo,
  removeLike,
  updateUserAvatar,
  updateUserInfo,
} from "./components/api.js";
import {
  createCardElement,
  deleteCardElement,
  updateCardLikes,
} from "./components/card.js";
import { getSafeImageSrc } from "./components/image.js";
import {
  closeModalWindow,
  openModalWindow,
  setCloseModalWindowEventListeners,
} from "./components/modal.js";
import {
  clearValidation,
  enableValidation,
} from "./components/validation.js";

const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const placesList = document.querySelector(".places__list");
const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");
const logo = document.querySelector(".header__logo");

const profilePopup = document.querySelector(".popup_type_edit");
const profileForm = profilePopup.querySelector(".popup__form");
const profileNameInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(
  ".popup__input_type_description"
);

const cardPopup = document.querySelector(".popup_type_new-card");
const cardForm = cardPopup.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imagePopup = document.querySelector(".popup_type_image");
const imageElement = imagePopup.querySelector(".popup__image");
const imageCaption = imagePopup.querySelector(".popup__caption");

const avatarPopup = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarPopup.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input_type_avatar");

const removeCardPopup = document.querySelector(".popup_type_remove-card");
const removeCardForm = removeCardPopup.querySelector(".popup__form");

const cardsStatsPopup = document.querySelector(".popup_type_info");
const cardsStatsList = cardsStatsPopup.querySelector(".popup__info");
const popularCardsList = cardsStatsPopup.querySelector(".popup__list");

const openProfilePopupButton = document.querySelector(".profile__edit-button");
const openCardPopupButton = document.querySelector(".profile__add-button");

const allPopups = document.querySelectorAll(".popup");
let currentUserId;
let selectedCard;

const handleRequestError = (error) => {
  console.error(error);
};

const renderLoading = (buttonElement, isLoading, loadingText = "Сохранение...") => {
  if (isLoading) {
    buttonElement.dataset.defaultText = buttonElement.textContent;
    buttonElement.disabled = true;
    buttonElement.textContent = loadingText;
  } else {
    buttonElement.disabled = false;
    buttonElement.textContent = buttonElement.dataset.defaultText;
  }
};

const setUserInfo = (userData) => {
  profileTitle.textContent = userData.name;
  profileDescription.textContent = userData.about;
  profileAvatar.style.backgroundImage = `url("${getSafeImageSrc(
    userData.avatar
  )}")`;
};

const createInfoString = (term, description) => {
  const infoElement = document
    .getElementById("popup-info-definition-template")
    .content.querySelector(".popup__info-item")
    .cloneNode(true);

  infoElement.querySelector(".popup__info-term").textContent = term;
  infoElement.querySelector(".popup__info-description").textContent =
    description;

  return infoElement;
};

const createBadge = (text) => {
  const badge = document
    .getElementById("popup-info-user-preview-template")
    .content.querySelector(".popup__list-item")
    .cloneNode(true);

  badge.textContent = text;
  return badge;
};

const getCardsStats = (cards) => {
  const owners = new Map();

  cards.forEach((card) => {
    const ownerStats = owners.get(card.owner._id) ?? {
      name: card.owner.name,
      likes: 0,
    };

    ownerStats.likes += card.likes.length;
    owners.set(card.owner._id, ownerStats);
  });

  const champion = Array.from(owners.values()).sort(
    (firstOwner, secondOwner) => secondOwner.likes - firstOwner.likes
  )[0];

  return {
    usersCount: owners.size,
    likesCount: cards.reduce((sum, card) => sum + card.likes.length, 0),
    maxLikes: champion?.likes ?? 0,
    championName: champion?.name ?? "Нет данных",
    popularCards: [...cards]
      .sort((firstCard, secondCard) => secondCard.likes.length - firstCard.likes.length)
      .slice(0, 3),
  };
};

const handleLogoClick = () => {
  getCardList()
    .then((cards) => {
      const stats = getCardsStats(cards);

      cardsStatsList.replaceChildren(
        createInfoString("Всего пользователей:", stats.usersCount),
        createInfoString("Всего лайков:", stats.likesCount),
        createInfoString("Максимально лайков от одного:", stats.maxLikes),
        createInfoString("Чемпион лайков:", stats.championName)
      );
      popularCardsList.replaceChildren(
        ...stats.popularCards.map((card) => createBadge(card.name))
      );
      openModalWindow(cardsStatsPopup);
    })
    .catch(handleRequestError);
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imagePopup);
};

const handleLikeCard = (cardData, cardElement) => {
  const isLiked = cardData.likes.some((user) => user._id === currentUserId);
  const request = isLiked ? removeLike(cardData._id) : addLike(cardData._id);

  request
    .then((updatedCard) => {
      cardData.likes = updatedCard.likes;
      updateCardLikes(cardElement, updatedCard, currentUserId);
    })
    .catch(handleRequestError);
};

const handleDeleteCard = (cardData, cardElement) => {
  selectedCard = { cardData, cardElement };
  openModalWindow(removeCardPopup);
};

const createCard = (cardData) =>
  createCardElement(
    cardData,
    {
      onPreviewPicture: handlePreviewPicture,
      onLikeCard: handleLikeCard,
      onDeleteCard: handleDeleteCard,
    },
    currentUserId
  );

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;

  renderLoading(submitButton, true);
  updateUserInfo({
    name: profileNameInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      setUserInfo(userData);
      closeModalWindow(profilePopup);
    })
    .catch(handleRequestError)
    .finally(() => renderLoading(submitButton, false));
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;

  renderLoading(submitButton, true);
  updateUserAvatar(avatarInput.value)
    .then((userData) => {
      setUserInfo(userData);
      closeModalWindow(avatarPopup);
    })
    .catch(handleRequestError)
    .finally(() => renderLoading(submitButton, false));
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;

  renderLoading(submitButton, true, "Создание...");
  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      placesList.prepend(createCard(cardData));
      closeModalWindow(cardPopup);
      cardForm.reset();
    })
    .catch(handleRequestError)
    .finally(() => renderLoading(submitButton, false));
};

const handleRemoveCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;

  if (!selectedCard) {
    return;
  }

  renderLoading(submitButton, true, "Удаление...");
  deleteCard(selectedCard.cardData._id)
    .then(() => {
      deleteCardElement(selectedCard.cardElement);
      closeModalWindow(removeCardPopup);
      selectedCard = null;
    })
    .catch(handleRequestError)
    .finally(() => renderLoading(submitButton, false));
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
removeCardForm.addEventListener("submit", handleRemoveCardFormSubmit);
logo.addEventListener("click", handleLogoClick);

openProfilePopupButton.addEventListener("click", () => {
  profileNameInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationConfig);
  openModalWindow(profilePopup);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationConfig);
  openModalWindow(avatarPopup);
});

openCardPopupButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationConfig);
  openModalWindow(cardPopup);
});

allPopups.forEach((popup) => {
  popup.classList.add("popup_is-animated");
  setCloseModalWindowEventListeners(popup);
});

enableValidation(validationConfig);

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    currentUserId = userData._id;
    setUserInfo(userData);
    cards.forEach((cardData) => placesList.append(createCard(cardData)));
  })
  .catch(handleRequestError);
