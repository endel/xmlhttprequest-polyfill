import "../src/index";

describe("XMLHttpRequest", () => {

  it("API", () => {
    const req = new XMLHttpRequest();
    req.open("GET", "https://localhost");
    req.send();
  });

});
