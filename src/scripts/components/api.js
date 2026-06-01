const config = {
  baseUrl: "https://mesto.nomoreparties.co/v1/apf-cohort-203",
  headers: {
    authorization: "0844093b-b312-410c-87f2-307a223e9b64",
    "Content-Type": "application/json",
  },
};

const getResponseData = (response) =>
  response.ok
    ? response.json()
    : Promise.reject(`Ошибка: ${response.status}`);

export const getUserInfo = () =>
  fetch(`${config.baseUrl}/users/me`, {
    headers: config.headers,
  }).then(getResponseData);

export const getCardList = () =>
  fetch(`${config.baseUrl}/cards`, {
    headers: config.headers,
  }).then(getResponseData);

export const updateUserInfo = ({ name, about }) =>
  fetch(`${config.baseUrl}/users/me`, {
    method: "PATCH",
    headers: config.headers,
    body: JSON.stringify({ name, about }),
  }).then(getResponseData);

export const updateUserAvatar = (avatar) =>
  fetch(`${config.baseUrl}/users/me/avatar`, {
    method: "PATCH",
    headers: config.headers,
    body: JSON.stringify({ avatar }),
  }).then(getResponseData);

export const addCard = ({ name, link }) =>
  fetch(`${config.baseUrl}/cards`, {
    method: "POST",
    headers: config.headers,
    body: JSON.stringify({ name, link }),
  }).then(getResponseData);

export const deleteCard = (cardId) =>
  fetch(`${config.baseUrl}/cards/${cardId}`, {
    method: "DELETE",
    headers: config.headers,
  }).then(getResponseData);

export const addLike = (cardId) =>
  fetch(`${config.baseUrl}/cards/likes/${cardId}`, {
    method: "PUT",
    headers: config.headers,
  }).then(getResponseData);

export const removeLike = (cardId) =>
  fetch(`${config.baseUrl}/cards/likes/${cardId}`, {
    method: "DELETE",
    headers: config.headers,
  }).then(getResponseData);
