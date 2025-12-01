"""Flask application for 'flask run': just make the app, defined elsewhere."""

from create_app import create_app

if __name__ == '__main__':
    from dotenv import load_dotenv
    load_dotenv()

app = create_app()
