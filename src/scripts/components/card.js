const getCardTemplate = () =>
  document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);

const isLikedByCurrentUser = (likes, currentUserId) =>
  likes.some((user) => user._id === currentUserId);

export const updateCardLikes = (cardElement, cardData, currentUserId) => {
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCount = cardElement.querySelector(".card__like-count");

  likeCount.textContent = cardData.likes.length;
  likeButton.classList.toggle(
    "card__like-button_is-active",
    isLikedByCurrentUser(cardData.likes, currentUserId)
  );
};

export const deleteCardElement = (cardElement) => {
  cardElement.remove();
};

export const createCardElement = (
  cardData,
  { onPreviewPicture, onLikeCard, onDeleteCard },
  currentUserId
) => {
  const cardElement = getCardTemplate();
  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(
    ".card__control-button_type_delete"
  );

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;
  updateCardLikes(cardElement, cardData, currentUserId);

  cardImage.addEventListener("click", () => onPreviewPicture(cardData));
  likeButton.addEventListener("click", () => onLikeCard(cardData, cardElement));

  if (cardData.owner._id === currentUserId) {
    deleteButton.addEventListener("click", () =>
      onDeleteCard(cardData, cardElement)
    );
  } else {
    deleteButton.remove();
  }

  return cardElement;
};
