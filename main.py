import json

from offline_agent.pipeline import run_pipeline


def main() -> None:
    result = run_pipeline(size=12000)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    print("Output written to ./output")


if __name__ == "__main__":
    main()

