export const generateRefreshAndAccessToken = async (id, model) => {
  try {
    const user = await model.findById(id);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
  }
};

export const options = {
  httpOnly: true,
  secure: true,
};
