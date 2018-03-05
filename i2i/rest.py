import base64
import datetime
import hashlib
import hmac
import json
import pprint
import random
import requests
import sys

username = "earths"
customer_id = 162
key = "be7448380ec44d82a5ce81c38344ed10"
rest_srv = "https://dev.i2ilog.net:9090"
rest_srv = "https://van.i2ilog.net:9090"

url_rule = "/ibis/api/v1.0/customers/%d/items" % customer_id
end_point = "%s%s" % (rest_srv, url_rule)

def Test():
    """
    * X-Echo-Signature: { digest }
    * X-Echo-User: { user: nonce }

    * user: user name associated with provided key
    * nonce: any integer between 1000 and 9999

    * url: rest rule end point (excluding server address) - e.g. /ibis/api/v1.0/customers/code/HPI or /ibis/api/v1.0/customers/39/items/id/94180
    * method: GET or POST
    * today: today's date in YYYYmmdd format - this is UTC (Universal Time Coordinated) date
    """

    nonce = random.randint(1000,9999)
    method = 'GET'
    today = datetime.datetime.utcnow().strftime("%Y%m%d")
    print('today: %s' % today)
    msg = ("%s+%s+%s+%s" % (method, url_rule, today, nonce)).upper()

    calculated_hmac = hmac.new(key, msg, hashlib.sha256).digest()
    calculated_hmac_digest = base64.encodestring(calculated_hmac).strip()

    print('msg : %s' % msg)
    print('calculated_hmac_digest: %s' % calculated_hmac_digest)

    headers = {}
    headers['X-Echo-Signature'] = calculated_hmac_digest
    headers['X-Echo-User'] = "%s:%s" % (username, nonce)
    print('headers : %s' % str(headers))
    res = requests.get(end_point, headers=headers)

    print('response    : %s' % res)
    print('response OK : %s' % res.ok)
    print('response raw: %s' % res.raw)

    if res.ok:
        print('DATA:')
        x = res.json()
        pprint.pprint(x)
    else:
        print('ERROR:')
        print(res.text)

def main():

    try:
        Test()
        print('DONE')
    except:
        print("Unexpected error: %s %s" % (sys.exc_info()[0], sys.exc_info()[1]))
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##
if __name__ == "__main__":
    sys.exit(main())
