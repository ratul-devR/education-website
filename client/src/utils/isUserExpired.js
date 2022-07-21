export default function isUserExpired(expiresAt = null) {
  return new Date().valueOf() >= new Date(expiresAt).valueOf();
}
