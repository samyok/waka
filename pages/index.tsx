import type { NextPage } from "next";
import {
  Avatar,
  Badge,
  Box,
  Card,
  CardBody,
  CardHeader,
  Text,
  Heading,
  HStack,
  VStack,
  CardFooter,
  Flex,
  Tag,
} from "@chakra-ui/react";
import PageLayout from "../components/Layout/PageLayout";

type Language = {
  name: string;
  total_seconds: number;
};

type LeaderboardEntry = {
  rank: number;
  running_total: {
    daily_average: number;
    human_readable_daily_average: string;
    human_readable_total: string;
    languages: Language[];
    total_seconds: number;
  };
  user: {
    city?: string;
    display_name: string;
    email?: string;
    full_name?: string;
    human_readable_website?: string;
    id: string;
    is_email_public: boolean;
    is_hireable: boolean;
    location?: string;
    photo?: string;
    photo_public?: boolean;
    username: string;
    website: string;
  };
};
// all chakra colors:
const COLORS = [
  "red",
  "orange",
  "yellow",
  "green",
  "teal",
  "blue",
  "cyan",
  "purple",
  "pink",
  "linkedin",
  "facebook",
  "messenger",
  "whatsapp",
  "twitter",
  "telegram",
];

// pick a random color based on the hash of the name:
const getColor = (name: string) => {
  return COLORS[
    Math.abs(name.split("").reduce((a, b) => a + b.charCodeAt(0), 0)) %
      COLORS.length
  ];
};

const LeaderBoardEntry = ({ entry, index }: { entry: LeaderboardEntry }) => {
  return (
    <Card width={"100%"}>
      <CardBody pb={0}>
        <HStack>
          <Avatar
            size={"lg"}
            name={entry.user.display_name}
            src={entry.user.photo + "?size=420"}
            mr={2}
          />
          <VStack alignItems={"start"}>
            <Heading size={"md"}>
              {entry.user.full_name || entry.user.display_name}
            </Heading>
            <Tag size={"md"}>
              {entry.running_total.human_readable_daily_average}/day
            </Tag>
          </VStack>
          <Box style={{ flexGrow: 1 }} />
          <VStack alignItems={"end"}>
            <Badge>#{index + 1}</Badge>
            <Tag size={"sm"}>
              Total: {entry.running_total.human_readable_total}
            </Tag>
          </VStack>
        </HStack>
      </CardBody>
      <CardFooter>
        <Flex wrap={"wrap"}>
          {entry.running_total.languages.map((language) => (
            <Badge
              key={language.name}
              m={1}
              colorScheme={getColor(language.name)}
            >
              {language.name}{" "}
              {(
                (language.total_seconds / entry.running_total.total_seconds) *
                100
              ).toFixed(2)}
              %
            </Badge>
          ))}
        </Flex>
      </CardFooter>
      {/*<pre>{JSON.stringify(entry.running_total, null, 4)}</pre>*/}
    </Card>
  );
};

const Home: NextPage = ({
  leaderboard,
  boards,
}: {
  leaderboard: LeaderboardEntry[];
}) => {
  return (
    <PageLayout title={"UMN Coding Time Leaderboard | Made by Samyok"}>
      <Heading m={2} mt={8} textAlign={"center"}>
        UMN Coding Time Leaderboard
      </Heading>
      <Text textAlign={"center"}>Data from the last 7 days.</Text>
      <Text textAlign={"center"} fontSize={"xs"} mb={4}>
        Have Wakatime? Ask Samyok to join the leaderboard!
      </Text>
      <Box
        style={{
          minHeight: "100vh",
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <VStack width={"750px"} maxW={"95vw"} spacing={4}>
          {leaderboard.map((entry, index) => (
            <LeaderBoardEntry entry={entry} key={entry.user.id} index={index} />
          ))}
        </VStack>
      </Box>
    </PageLayout>
  );
};

export default Home;

export async function getStaticProps() {
  const apiKey = process.env.WAKATIME_API || "";
  const boards = await fetch(
    `https://wakatime.com/api/v1/users/samyok/leaderboards/?api_key=${apiKey}`
  ).then((r) => r.json());

  const leaders = [];

  for (const board of boards.data) {
    const boardLeaders = await fetch(
      `https://wakatime.com/api/v1/users/samyok/leaderboards/${board.id}?api_key=${apiKey}`
    ).then((r) => r.json());

    leaders.push(boardLeaders.data);
  }

  const leaderboard = leaders
    .flat()
    .sort(
      (a, b) => b.running_total.total_seconds - a.running_total.total_seconds
    );

  // filter out duplicate usernames:
  const uniqueLeaders = [];
  const usernames: string[] = [];

  for (const leaderEntry of leaderboard) {
    if (!usernames.includes(leaderEntry.user.id)) {
      usernames.push(leaderEntry.user.id);
      uniqueLeaders.push(leaderEntry);
    }
  }

  return {
    props: {
      boards,
      leaderboard: uniqueLeaders,
    },
    revalidate: 60 * 60, // 1 hour
  };
}
