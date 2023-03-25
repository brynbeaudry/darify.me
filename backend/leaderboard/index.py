import requests
import json

def lambda_handler(event, context):
    # Get prompt from Backend API
    try:
        print('Getting list from backend api')
        res = requests.get('https://xdg792fpxd.execute-api.us-east-1.amazonaws.com/dev/dare/list')
        sorted_dict = dict(sorted(results.items(), key=lambda x: x[1], reverse=True))
        results = get_true_results_count(sorted_dict.json())
        return {
            'statusCode': 200,
            'body': json.dumps(results)
        }

    except Exception as e:
        print(e)
        print('Failed to retrieve list from api')
        raise e

def get_true_results_count(api_data):
    true_results = {}
    for item in api_data['Items']:
        username = item['username']['S']
        result = item.get('result', {}).get('S')
        if result == 'true':
            if username in true_results:
                true_results[username] += 1
            else:
                true_results[username] = 1
        elif username not in true_results:
            true_results[username] = 0

    return true_results
