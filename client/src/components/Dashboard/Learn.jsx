import { Button } from "@chakra-ui/button";
import { Flex, Heading } from "@chakra-ui/layout";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import config from "../../config";

import LearnImg from "../../assets/learn.png";

const Learn = () => {
  const { t } = useTranslation();
  useEffect(() => {
    document.title = `${config.appName} - Dashboard`;
  }, []);
  return (
    <Flex w="full" h="full" justify="center" align="center" direction="column">
      <img src={LearnImg} alt="Illus" style={{ width: "100%", maxWidth: "400px" }} />
      <Heading fontSize="3xl" fontWeight="normal" mb={5} textAlign="center" whiteSpace="wrap">
        {t("user_dashboard_learn")}
      </Heading>
      <Button as={Link} to="/dashboard/quiz" p={5} color="black" colorScheme="secondary">
        {t("user_dashboard_learn_button")} 
      </Button>
    </Flex>
  );
};

export default Learn;
