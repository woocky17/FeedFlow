import { Heading, Text, Container } from "@radix-ui/themes";

export default function Home() {
  return (
    <Container size="2" py="9">
      <Heading size="8" mb="4">
        FeedFlow
      </Heading>
      <Text size="4" color="gray">
        Agregador de noticias personalizado
      </Text>
    </Container>
  );
}
