import {
  Avatar,
  Badge,
  Box,
  Card,
  CardBody,
  CardFooter,
  Flex,
  Heading,
  Link,
  Stack,
  Tag,
  Text,
  VStack,
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

const LeaderBoardEntry = ({
  entry,
  index,
}: {
  entry: LeaderboardEntry;
  index: number;
}) => {
  return (
    <Card width={"100%"}>
      <CardBody pb={0}>
        <Stack direction={["column", "row", "row"]}>
          <Avatar
            size={"lg"}
            name={entry.user.display_name}
            src={entry.user.photo + "?size=420"}
            mr={2}
          />
          <VStack alignItems={"start"}>
            <Heading size={"md"}>
              {entry.user.full_name || entry.user.display_name}
              <Badge ml={2}>#{index + 1}</Badge>
            </Heading>
            <Tag size={"md"}>
              {entry.running_total.human_readable_daily_average} / day
            </Tag>
          </VStack>
          <Box style={{ flexGrow: 1 }} />
          <VStack alignItems={["start", "end"]} justifyContent={"center"}>
            <Tag size={"sm"}>
              {entry.running_total.human_readable_total} total
            </Tag>
          </VStack>
        </Stack>
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
    </Card>
  );
};

const Home = ({
  leaderboard,
  range,
  updated,
}: {
  leaderboard: LeaderboardEntry[];
  range: string;
  updated: string;
}): JSX.Element => {
  return (
    <PageLayout title={"UMN Coding Time Leaderboard | Made by Samyok"}>
      <Heading m={2} mt={8} textAlign={"center"}>
        UMN Coding Time Leaderboard
      </Heading>
      <Text textAlign={"center"}>Data {range || "from the last 7 days"}.</Text>
      <Text textAlign={"center"} fontSize={"xs"} mb={4} color={"gray.500"}>
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
      <Box my={10}>
        <Text fontSize={"sm"} textAlign={"center"} color={"gray.400"}>
          made by <Link href={"https://yok.dev"}>samyok</Link> &mdash; follow me
          on{" "}
          <Link color={"blue.200"} href={"https://github.com/samyok"}>
            github
          </Link>
          !
        </Text>
        <Text fontSize={"xs"} textAlign={"center"} color={"gray.400"}>
          last updated: {new Date(updated).toLocaleString()}
        </Text>
      </Box>
    </PageLayout>
  );
};

export default Home;

export async function getStaticProps() {
  const apiKey = process.env.WAKATIME_API || "";
  let range = "";
  const boards_url = `https://wakatime.com/api/v1/users/current/leaderboards?api_key=${apiKey}`;
  const boards = await fetch(boards_url).then((r) => r.json());

  const leaders = [];

  for (const board of boards.data) {
    const boardLeaders = await fetch(
      `https://wakatime.com/api/v1/users/current/leaderboards/${board.id}?api_key=${apiKey}`
    ).then((r) => r.json());
    range = boardLeaders.range.text;

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
      leaderboard: uniqueLeaders,
      updated: new Date().toISOString(),
      range,
    },
    revalidate: 60 * 60, // 1 hour
  };
}
