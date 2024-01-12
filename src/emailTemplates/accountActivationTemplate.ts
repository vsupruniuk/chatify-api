export const accountActivationTemplate = (OTPCode: number): string => {
	return `<!DOCTYPE html>
<html lang="en">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap" rel="stylesheet">
  <title>Account Activation</title>
  <style>
    body {
      font-family: 'Poppins', 'Arial', sans-serif;
      margin: 0;
      padding: 0;
    }

    .container {
      width: 100%;
      margin: 0 auto;
      overflow: hidden;
    }

    header {
      color: #FFFFFF;
      padding-top: 10px;
      padding-bottom: 10px;
      border-bottom: #31C48D 4px solid;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 20px;
      color: #31C48D;
    }

    header img {
      height: 70px;
      width: 70px;
    }

    main {
      padding: 50px 0;
    }

    main h1, main h2 {
      color: #333;
    }

    footer {
      padding: 20px 0;
      background: #31C48D;
      color: #FFFFFF;
      text-align: center;
      font-size: 14px;
    }
  </style>
</head>

  <body>
    <div class="container">
      <header>
        <div class="header-title">
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAM4AAADSCAYAAAACC/8kAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAADYuSURBVHgB7Z0JYFTl8cBnvre7SUjC4VFEUVHxAIXsJsiRg8PWsypW/2C1h1er9ULJAahVt1oVSDYgVq3Wq55VWq+23gpkN+GQZANiLIpK0dajKEcSkuzu++Y/3+YggRx7Zzf7fhp237X79r033zffzHwzCAZxwZQ3yg/Ykw7TEOl6JBhCCM/JRvnkxtNLvgWDuAPBoN843rUo06JrNmGiq5HwdAQc1nk7IX4iffpvNk4reQ8M4gpDcPqBrKryw9BHNwLSTEQ8to/dG0nSz2unFr8MBnGDITixwm4X2acNmwnku14STMdgrz3Bgzrpj5jRst2HMnNDfuGHYNBvGIITBrNemKW5MwpMW86a09LTPietWTrc7NXn8pjl13yxD4DI8Ad3ftH1YNBvmMAgJHIqy0/bQvREBnjV4N2673aljgkp54NP/xU3T2mRbKGIIAUM+hVDcEJgfOXiC3Si5Urd4j9z523W1feMAq/lWpBU1Lo58iBQKkQY1TMKEGat0aO1pPErQJrmkanCJFJ9qJs1FPy15AXS9/jI/H2apXnXoNff2rXSvtIHSYghOEFirSy/Bonu71iBuEO9TF9hN+02Z15BPloKAiL+YHeGrW0tECFOXnf/IT5P0zPcM54CoAOkIKTwIMyPiWWF/9NIqDEWtGr2Jl5N4PWmwK4fne2znXrOR7ypmnxyDQixYkNB0ceQBBhjnCCwVZT9hgXlPr5qHQ0OgnzLp8NvNIFP87ZciAGsqtlrC4p+F+DuOPGduw9oGZSaatYhRSeZyucrdUj7sm76NY1WV/mr3C+eDZGhhS+IMlpU6gTP7tltdvc2/ktkDMEJBLaI2X6UcRcBzt/fGkZ13AUcymuHQixA8KIuJ9RMLdnY227TyW7a5cr8JZ/fAhD4A5a2QXzwXrWSaIfqKVjYf4hRew7oU+4d3+N+62l3bpGTv4tggGAITh+MXrNscIbP8xQ7J8+FOIB9OvPZp7O4r/2yXWVK0G+GuIFqWem7vwk8z2/On18PCU7SC44yKW8eMflnGsLpfDWyQZmMJXn41c2tZTO3kafx+iEQOdgyDV/zP5+jpB0SoZFXeRCFh4XCx1sForTwrbGwsKbwfpJINgrUNnkJ/vZBQeFnfX2BzenI4nN2QxzeXx4z1fNY6BEkea87r/jfkKAkreBMt9tNO2ZkLBACb+CrcBBEh69YJVrFovAvIlonyPfhrvpB30Rb77e5HLfyyx0Qx1Dr/0/6dH3RpmnzP4IEIymtajkVd43YJVL+JgCnQETBBgDp5N7jZR5XOGumzO2XB4Jb9UyM8zaxdVyFl5iFdiH3kM+mNmLJ6jMKv4cEIel6nHHryo82eehNfjsaIsMetkq9CIJeGjy54dWVaO93v0aWy3EhG5D/AokEwf8kwMLjvlpz7/LZy3WIc5JKcMY6lx6RgrqKND4GwoPH3eQkKZ7f6dv92NYZ9maII+xkF69WZX7IZusTIPHYooN++cb8eU6IY5JKcKzOsscQ8TIIEb5YTTxWqWBVaOF5+Y0VdrRLiFOsK8tORjP+nUV8OCQY/vGPpKU6eu/8oOCmHRCHJI3gZFWU/lwI8RSEAkEDC8tytrCVuacW10GCYKtcMoWNE8/wDzgKEhC+5psQ9Mvc+fPXQ5yRNILDA9A6/rVjgjlGtXyC6E/SpN1TO2XuVkhAbJVlR/KveIJ/ynRIRBD36JKu3lhQ9CTEEQkvOMoP89HwCccBCrMOnv99VHDz1/t6qE+uXGz1keYO5nNJwmu63lL0wYyb/wWJDhFmVTquEq0O0cMhEUG5aA/Ju+LFeZqwgjPOydYxpMUsJGe2hpO0QaCsWjvZcfi937FImMmm4YO77NMLfEFc/FJSk1+0BgYYKgxntyv9HBLiWr5OKq4uDRIIbg3fAq+4sHbG3J3QzySk4GStuscmNMvf+e1hEDn+wzq1vTav6NGBFFPVEyevWHyI14I5gnAaP5FTCcXR3LgM6xzAGo/wjfnQp8OZm6YVfQH9SMIJjq3ScQFfPeWjiNQNZp+BfKTFO6i4bsa1DZDkjN9Qmq7t8g4CU8qZKOH3FIeqnTIaeMj347qCBdugn0gowbG6HDfxCd8NkYLoHR94r2KTZ5/xX8nIqBWPpx5o+f4GKelW7oXTIa6gOt1kOX3j5DlfQj+QGILDg1trZXk5n+wNEIFz5hbrW25Jr2a17CVMArUsXNR4UkO6gy/8zyCuoNVms+ecdZNu/g5iTNwLTs76h8x6c/3TCDgbwoSFZDc7MO+tN5nLtkyesxsMgsJWVT4NdXqQgjTrR5k33HmFZ8V6XBrXgjPiVfug4cMyn4/MDEV8nRBvrs2bWwsGITNrk92yZVfmddxtqxmoGRAPEJS7C4qKIIbEreDkrF84RDZb3uGrMgHCgAg+RwEl7tzCF5PBWhYrsleUjyazfJYfoZOh3+H7aoaJ7kmFMYswiEvBOW5F2UEZZnTyUx56kCLRdu5h7tJS6x+unmDfAwZRIauy7Ep2rN7Jrf4PoB9BtrRJb0NB7Qx7THw8AuKMMe+WHTnIDG+HIzSsgz+9B/Ws2vyipYbQRJcNecUP6yY5mRv9v0I/QoAnSS39aogRcdXjKKGxWPDvAmEchAT9l69gsbug+DkwiDnZzvLLSNDC/up9uLH9HjSRE4u4wrjpcVQwYmo4QoP4CUjPqYbQ9B81BYWPCw+dyG+XQz+gUgyjLh+GGHQIcdHj2CruPhg1i5PdNcdDKBBtbLJ4TvlXP9jzDbony1V6nQDxW34b4/lASDr6Zm3Mm/c3iCL9LjhKaEBLreGHfySEAuJ7NAgvqLX1f+CfQVesqxYfi8L0AD/LP4IYwpbU7dLns22cMT9qUQX9qqopoSG0rA1ZaIBeTK2HWYbQxCe10+Z9UpM/9zQ21qieJ2a5GNjvd5ApxRJVv06/9Tg565eM0Jv0Svbmhzo78Un2GF9q+GYSg4lOx3E+Aa9xbxBuvoeAQaIJNQXF1RAF+qXHyalgoWmWrpCFhmCRO7/oEkNoEod1BUUf+zJkFglc0jZnKuqQEI+PWmGPSgL8mAuOMjn7UL7JXd3REAIsKTe7C4oWgEHCsTGrpLE2t7AQAc9Hlawx2hCNG6ZllkAUiKmqZnPddyiR5zXWQbMgWPypYGE+OzXLwCDhUao6NetPs+PyFIgquBtFS05N7k1bIILEtsdBz29DEhoAD+j6bENoBg7VE+Z+VZNf/EN+KJS3P4qqGw2WunkpRJiY9TiT1iwb2eLz1vEXZkJwtAghflqdO9eoujxAUUniUeBzRBS16QqsrcyuLSiKmGM2Zj1Oi8/3y+CFBnfyGf7YEJqBDY9ZN/hAn87Ph+oZomPwQVh00jtLI+aMjaGqRkFNRGN7WROgmOnOLXoXDAY8G/NKvq3JL5rLY57L2HgQccMBC+VRpjT9dogQMVHVrKuXjEKf/nmgtWTZ/t5MQjvFnTd3NRgkHaqQr0XXX2f1ygYRhLsy6QOctCk//Hk7MelxSNcLgyjA3MD2sx8bQpO8bJp84zc1eUXZBHQLL0ZsWgg/gcKM9Njo124fDGESdcE5Ye0fDhSEFwW0M1IzoH5pzbSS98Ag6anNL76bUM/jnqevLESqUNfnEAgE4zKGZoaceL+dqAqOyhyZ6m1ZFlDFM+WnkVjsjnJUq0FiUZs3rzb9e59VEDzYzeZGVr8eAWk+nED+CQIEJS7OrronrPpIUc3auKsq43buHi8OaGedrq2dWvxHMDDYh8qZ/nzR19gqFj8PQlzGvYaFkD5IMaXcv7YtW1GWy5EWxIDdQtL8AL+eBiESNeMA/8irQWgPBLSzhHvcBYW3GLFnBqFic5XfxnrY74I5RoK8cEN+yQsQAlFR1bKcpZexVez+QPZlSXllx+H1dxhCYxAObEgIOk8eolg8Zv2SERACERecbOfiawXgwxhIb0b0SYtsvnrrUfFVCtAg8RAhBI1yU31kapMshhCIqOBkuxxXSdTYGIB9jp1YqurJpJ320dRboh8lazDgYcvt+/xMBd8AIxTaXIuCzt0XMcGxuRx3E9EfMcDP5H2vStQqZwbxx/qCws8IMbTSH2h6cvoKe1CGsogIjtVZ+nt+uSlQJyeRXG5kozGINEgytJhGgjG7LZm3BHNIWIKjcjvbKh3LeJAVzJd+no7yCjAwiDDk0d+EEINEJcGN499bFHCWpZAFZ9QK+1CVEJ1P8/pAj1GxQkj6NZVxUsfRYGAxBJtWEUFIVcFZVxqqWbRSVVImkP1DEpyj3144ZJg585lgqwgo725Nwbw3wMAgCqycYfehoIcgZPAca1XZWYHsGbTgqIToQwaZVFhMQF/QcUpEX5ua9MhVUzMw6AaJ4kV+CTldGJJ4yF/ivg+CEpyc9VeaB5ngJSD8IQSJBFhYfWr/1Ww0SA425Bb+h9WtcLSawwBFn8lgghIc2XTco4iYD8FC8LmWlhlY+I2BQZhoaLLzcxr6dARJv8l+756c3nYJWHCslWVL2dz8CwgB1Ojq6glXecHAIAasz79xM/sJHRAGZDb1GpwckODYnI7LkfAGCI1t1VOK3gIDgxjizi+6TSAsglBB0eu0gz4FZ6xz4RHc04QuvQS3GpWdDfqD6ryiBdzgXw6hqW29FjbrVXBmvTBLSwHLH/npHwqhgLC1vt78PBgY9BOqZo9Pwjh2zriCOY5b+lF2u71H+ehVcD4ZOekcQjoDQoXguS1nzWkBA4N+5AMVxwa+C7klXxnoMSxolldOsRzY0/YeBWdkVXkaSHFvQNMDuv9mj9ek3QsGBnGAO3/+f1HAr/nBDLj4mCTssfxMjxGhBxPM5C7jCAgdp8pWAklEVkXZ6TwgvZIQjsMoT0sPBFKz6yV8Qho+XptX+AokOTW5hVusrvJFfG8WB3SAZjqW/3V3t6nnmyvpd+FMrJaAIU1JTVSsFWU3g0AVJY5hXLaI4j8PAWORaGZ2RWnZYL3xJhWWAkmMT6e/WDT8HQGl9bUvm7TG9rStW1VNtZx81Y+DEOEWV5r2eJLGKDChymFTQhOyWhsDSIjindrgH0OSs2la0RcS6F+B7Kuyf/a0TXR/AP4UwkAQuKpPXbALkgSvhGvjWWg6EDQLDNRDH1AENau6PRoH9lPVxq5YfAgPooLK87wvUsp/QBKBUo4A0bkNwo0g9X4fU6DA0/jmT2pfZm96WLnEBgqSYE8g+jSC6FHr2k9wzCbTFL7EgyB0CIVcAUkM68+f1k4tuQ36GR4IZyBQh+Bg/Ay/+hW+JqkB5ZJBOhKUL8dul/tuE/t/qAwsgWDPbB3ibaoFA4M4hXvhgMpoKl+O9fQh3VqWuwiOP2EBYtAZP/Zhc7Jbbgzil9FrlqmE6wFXBUSfr1v1tovg1KcOGs9SNgrCgtaBgUGckuHVs1lhzQh0fwIxrLv1XQRH+sSJEC5ETjAwiFeEnBbM7uxaOaC79V2MAyTg/LDjmAn/CwYBkbP+IbNs3n0foPZ/bOr5bwt4z64r2H+WrM216FAi7RlWurOQ8A2glhvcU2/+HxgEDUl4jnucefw2QAMYjepubZceh4VmFIR1VrTL0lD/JRgEhGxuOJNvwVV83Q5koRhnQfOy7vZDqS1GxOlsFRvG+11EaAnXgJO0bCgo+pj7hhcD3V8QHtzt+vY3toplB/ONCTivVA98u/as3wWd/DpZ4d7jkC7LQOnd7ceagKnrfgHUGzLoEbNFL+HBS0AGLDZJd1vwuUNwSHisLIl9xu/0/iXwPRgEDPrki9geRIj4HXuOu60PRGhy8I1uz9xSJ4R8AgxC5v2J877m6/54YHtjt4aETqoahm8YCCJkO6kgQpur7DZrpeOWsSvsHTeiekbx9hSBeSwUVuGRJ7indl+NrjbvxveBzMdJ8J4kmry51XnzPt372YDZrvKSrMqyMqt7SWgTDpOQdDLfEkh1axaQbnucDhUAJRwTbiZpluK+ajUmJbZKxxl8dX6nDC8plsyJPNi/Ws0PUdtW5xY28cuGvj7DPXWOMgZ0MQgon0Smy1vO6sQVrIuDaNBV0nFjDlQAOPl6ZjmXzBdIT/axax/maC1wp1BPkJSfgsF+kKZ9xDLTmvaX4FxWvV5SJewhDFRMYYbPu5xbq/Y83JLMlNShTsGyoWDuU9ygvd7bPoR9qGpEELaqRii2gMF+qHImmtSn8xXaoZa555kIur7ZWlV2w/ANpenBfJbKA8E92NUpZm0D7q1h6WPBPKdmcslGMAgKIfGK3lQ2Itmt2dqvqk185+4DvdC9oycYWN0zjAM9UD11Xs34VaU5mgnf4l5nNN8sC0hYemg93jbC6XjQ69VfTx08ZF1P+eey1zgmk1eetwXFRXx8p/gp3OrV8axN0+Z+BAZBUz117lfZq5b8kO3O66CbiAK2fJo7FlbYTVZzZsl28eVSv+B4U1OPCrE6Qhd0MxmC0wsbp5V8bl2x5GRMoTksNKrYq8arD2CH3C0Wi3aLbGr42lZRVicF7mDTdDNrAZpQGYaEdjL5lK+nyyBUR6RHU+rxJvcZc43rHgY13OhkV5X9H0lUU0FSumwUe7Uyqzn9cR6PpHyZu6Sp1TggaDxICA+CxjTNY3iz+6B2xlxlVr7Duure51DzFrJ+exm3dK03C+EQNksfItoWWicBoF+P7kQLr3hZE7hofW6xGwwiQk1u8ZvZzvLz+HK/2HlaNd8Fv7/HVuX4IcvIzyR5z1TLrfeIMGzDAPPdWRM9O8AgIGqn3fCJO7/4at8uzwi+UZfy0P7PbLXevG8dS7XMY6LPJMm/8Pu5lC4O4eN+uj63yBCaCFNTUPiGD7WJfJ03ta8jIrPNufgikPgML/7v253N/lhMf4/DN+7ocGc4sUl0mx3t4fZbSccHZ9+kGps/q7/pdrup/uyMoXqT5wBBYEIdPailNjZ9fdh3dbNne8Ag6mzMu2FTVlX5GShpW1s928GA2rN+KQF49qtz7f6soK2qGsFhECasVnwOBmGx0m73gR2289vtYNBvqFIhNqdDqrnTndfzivfa3wvl1WbCjVED0smIGjAYOCD5/W7kL+3U6ng2S+xQj8X4qrKDWXjCyTHQ9kVGK2kwcGANarlKc8bjyxJW2bhTwK++03d1ZMcRGuAJEAGENJyfBgOHmrziqzJk2kFDfPXLQE23kfT+1hn2DsONiWVqQiQygknUk3cezj5lTATCqPGVjgsgQkhNc/WVTpgHtIexBWhy53VIcnSXbC5IRrmVIHAVXLMjy3n3cXw/U3lAs6nzNhNbwyZhBCTHkwpJG6fGV6+LA5IfTxt7Nv8KEULz+baMrSqfVJdb2K2j86R1jsPRQ6/zSPbE/c6s64kZs3ODxGxKO1TXpZoTtb7zehYmDCexeisInrqJ85IqwXpn2PiyHKIKjk7RyaUmG+67RQmNqYVWIQQQayjEq2AQFLpX908a5Ibwg87rBbeOP4BwIdgFkYjZSVDYcfZ3Vtb+BNEEYQyh5+Vxzns6wtxPeOfuA/1Cg3hUX4ezGvfPnZ76v4BBUKAQapau59wpu7tMmTGxel7Kmx+EMGDXUNLnGcC6jGvhxMat3HpcqBI8RCKXNFt10vji7p0zhZhrAvNfx1Tc9XNzk0UXKbimG6Fp4S/2O0vJ/z/uBCmfSLFYHFsL7M1gECR0JF/P/Zz7pvrhlsczv/Ut4CbpSAgRbm2T3vlZfZU/qvlu9ZfvfGCYx7IzzGmBAF5v6nn88lBbMGgbeEoKpv0J00n53vYRGmLzqfw/k8W3Wi1peip5LOn1RsXv0OGeeji3WPtZjE1bjp3Tku0qL+Om6T4IEW4ZjQlsnVDWGIgMj1qd5SnsU/gDdOrBWEvorlwHCw3OrCmYl1QJ76OOEGlEcr8pG/5WcbB39x8DmX/dEyrJOBhEhdqCwgf4Ahf3sZvUCX9cU1BkCE2k0cmCUn6y72q/4Khcz9wl/RZChFvEr8EgargLispZeBZ0t40bPJYZce7GgsI3wCDisBmaPTa0n8W4Qw9v8aW+wOpaSGMVE4ptYBBVWHgWsSp2LgvQBn9OMMQ93Ni9w385tXlz/wkGUYHHjGxosezcd32HxaZuxrUNWS6HKiz6RwgGHjitzy005obEAGX25pe/g0HMkKjt1tG3XxxmF8vPIIHKkfctBAEbBm4HA4MBiiC5RTTtPxTpIjircwu/5x7nWQgQVhM2pwG8BAYGAxQdRO35qxv363H2c9KNrSofnarTB9yTpEIfqCm/tfnFfwYDg4EK2QVgAKUM63ILt0iE96CvzyP4XkvNDLh3MjBISHpIB2DqbqWU+JQm6Czo7fMQ1hke6cRm7Ir7M1JMTTeyyfVovqGP1OYWVfW2/8iq8rSDQZ4HEqZww3kC6yu1rHHMgySkW8E5/uuRy7eM+OI+vjA9l5OQNCCjoWe98IL2yaFfViLQ4WqZfKyOTi9+GwYgKeamJdwE/krNJmJBmHnSOod108SiL7rb1+p0zEIdyljA/NH0KnUVJXFgb7eCs3z2bN3mcqhI2ut6OlBq+yRu6z8wZ3XpRN0HZwKKY/kJGEKIGuugHkn614iiArzaP9vymfXNLP5AlzyMn4xD1SJpMl5+Z5+MfeEFi37o5/7z1XenebacNaelj0PObX/DcnCA2eOz8dv9BGdCVflE9pD/ha/tXtWe/Uh8UCMkKaaeNvA1+hui7FFwhIzAPJ4wGPGqfdDwoRkX8827Xeo4EtvNHLh3Wp5Af2zklWDSfTZX6StogjsGcn7llEO2Xc63tDXSPdNbw//m9HoA4rvcZ1zUtrRbB9jc3W4+XS5C7EgjqpzkN7rzCpN6bk+PEby1+bsqOhUz2h+EMdBPnLTKcfjwYZlvosA/8Q0d2WVja6WtrmMvZJEBcYH0iXXWSsfto19bljC9SDRJRbyOVdJSvmjPg9TP3Zg/fz/BGbvJbmGRyW1fZk/6De78oqSfENdjj+O3JjhLnfzAndPDHsOsK5YMDVgFihA2Z/mPCOUL/nqY7RCtkQIeF7rH5aWUerPm0/lBGEqQdhSg/ku2J56rzOuo8gIT2DMGe08c/drtv9qS5GUXV7dOxe51cJ/WPPQQVnktbYt7TBZvrwaEZMHU+2bxMv/Tk+CAlqKr2XExE5zs1UvGSJ/+eCeh2S4E/fqcKQ2vdpNFVM2vV+l8/mldtfhYoZmeYr/TJLWBBWhW5uDByhs8Bwx6hRopHfbOBmrQv/E0gUHvgsNPoqu32VgkYSy//AtigCptrjc3LG9Xzdic86FG3rOqcxdsq+7j2Npp8z6xupecgQ30T5aadrXj+qxViys3TJv3PATI8a5FmYNQO52IjiLCAxBpN+riQ2nGapX9EUJg/JpFI1E3TdeADpWS0rh3/MoL9JkH5drN+fPr2/fLWus4Dj3Sb7AQPt+XNTNu6phcZXOVTyDSM1gl3Zt3ACHD6iyd3vm7pMnctHHKjWvbl60r7EPBlG5t3ah7aqct6OhNcioXH6NLPBxQdiSr5F6b5LD0XP5cX+shmr5xeqHTVlN2JAtYx6S62ncbK8AeWDrkLufANKGs7vy745VeBUeVtmbrmrKyHN7ddm7B1Q8OuPR1OPiaGgoFtiWkQNgDQpxdPWVBwFHZtba5O6dUlZ/TrNOnfLy/Vibb3u4Z/cmyl9Vkvt6OHbXi8dQDLN85WFgu5R89CDtXEtBUXSCSfJ2e1htlycbTSwKK9bNVlk5hk52DdJrE5mBB/s9Ev33XxO9NIJqzXGWLm0EvUw8SeqCYx+e/VsdKs2Upv8zt+DCkxxDEuH2+4jjev0uFNqH7VvLLjI4VpsFnsfA/43+viTX875T2TZJUiXg4v7O9mc9zOFsu3243vmgaKataBjWDjb+rPfRKjp+anssWmLUQAELLuJKtoItavwDf25xb8iNIAPqc3sv2fVfPG3EUxIDpK+ypfKJ7J3NJukdVOYMgUTo9gbyWT/zP6o8fgIqM/+3p3fIEePAwy/c1LDTX8EK3GU/bknP/UksXa8dULBkBfcDjtCIgwa07TVFC08Nu/JvxtkGkrRlTcVefn9mfpIF4s5MhSYiUHsfFXeHWggTO7liU+qOAieEbMvW9i/ywR/nC8JO1B8Juc+ZMfmlzxtK3otkX8jTv2oISFSYUcKiQAKEyOWZw61vPAvuUJHrLZErZ5hWedLbdHcW9YCFfiHZVY1Sq0N9hq112Tz4UK/ci/BtK2pdVbmK+us+y+veaQPzaixJZ/TsUlcULeUyGODYFUlby9zt7PEmJhUD6Qdx8c2tNV7R97scoZZfIdTRpAc/yJZL3sVAvJxMO51Na2nayjTro12iErclAkHT1qgoAZzsdavr97/3fQzB3ZNXcu1QBpt6+I7vSMYnaTeYE2y0W75uQIAQgOFDZ4xaMRIn3vuGH9Xzc66hZU33qgl0QK1R5O8Stumw+fUPBzR/vs9VlJ/szr7gy7+b95rcdMDZjiPeX/Ga/dFE8pjqNFbKSTqs+l+A7s7YbMzDztNXlYFUKn+Rffhzsl5hjL+6CwnfUq62ibCg7r/yCww9vg3tqScjpoLiBWen/zDVlY9uLjrH7s+F7NC3/srVSdhcQNDa+6GqWqioHOOgA36EzvwTo9fv5vl7Zfl/5sx9bN+nmhEnc36eqlqZpn/S4kXXeznm+ogVf246HhlvmPgNQI40kOLsbofGjrHnurw6/hc+yo0cQRFd0ty8K023t71mv/6bFoudu7F5o/NTmF73GR52jkn/zohnimOqCG7fxUK9DrdeEuKS3/VWcnBB4YccKTX8EEog+Bed/O029ViEwkTYeoo44uv0dSRnbIrEI727IL/yw131mz9a59Vzcvsiq+6SctxcO6byLbe2SKax65XXs49Pn1E2c12euBnfe3NVscbsbEgA2EHRWoc+wrll8bE/7mk1NF/P4uXXMiLCqdvK8TyCB6FFwxr9Z6s/wmZHhVzt6BsWhEG2IOh5CtMQ2PooHrAFN1LOk6Cq3cEP7sifVcmCXHTz6tI7PBPjPT1Y0BpxbWvjwYb/yFed4htarHAh781Z4tYt72pcNHx09kpR6GSQYPQqOlqE9xyZWDwp4GHqBB4ijIOqQr/2d0E1hJ/oLCoEBZSlNb9yznQW8wxmsCd/gzttZ3bJ1LCC8bbcHXvbx/WlFX7C29jHEOXUn2T1sV+/IWcEq9mVsEd1vHD3BWX40XwO/6ZtHOJ/u8u15BxKMnh9CIqVT96hX80V5mX/1NYJE1OO+eDzQkWVfgjwaYgjJVstRX6gUW6Bm2rah6eZ9ri129Mzs99kMQcKCVwMJgKbLJ/mlPZTpyN3mjHP33ccHpLQYv1WAe6jnOtedSRR6FByiXsc/3hTEi915RQ+em19/B0QZJKrtWJBkhQSEG5r2eC/1sAQkjF2QmBCTBt+fweM2wlfalyWKsztvZyd0GotMm/qPbH3XE3IWcc/C0Zsjim/86ilz/a1ELCpNk4Z7a5MIcd6sF2ZpkGBwQ9RhZBGaCKV05HBIEAS1+X3AH019kdW9ZGj7crPHMx3bTOvsK1pVM21+bI09EUL0smFPj0chpo6vKJsBMcLshac7vpq7/49HTD4TQsTmuu9Q6ypHbvtfzvqu1q9ogXJvTB9bBoO7dna7uk85kCBUT53LaiW2aQmYCk3y0vZtpGm/3vvelHBGgXZ6U8d6jbnSNO0u1ZKwPf4Qq7PsBogianDMg5v2OSBqeucd4zeUpkOwqIAw8PwFNaj0/wl6S/emRN0P5UeT73echhAFtsqygKtD2KanT+p1Gns8QnJv8Kz0j2lg0opFI9lkfWrb2m0bcm9MmEiBfelRcHSSm3o9EmgyNsoNKabmj9j7e4tfd40i3P3/tq2Alb9UoGjQ7oIgYQFXXvuC9mXWRR8JJeYtFFo8tBLaGiN/UCdBSYCHIpjwgYB2FHtN1uyJj0Bl19DR93x9H5+MP8oZAW3WKkdui9msBCjDv07S/ZDA9Cg4KLRApgsc0RZpfHCTlHMhilRPK1Sl5Arb/RlsMLjB6nQ8MGL9QwGNF7KcpfNRwzvbl1Uslw6Dfgcxos4/aKan2pf5YbrW6iq/pK/j+Dcu7BQL1zsIHfFxSGzFo/4Tno2nlzWqkucdKyRcxsPm89VbFQnRnOq3viUsPQqOZ8jI16GTQ69PCC9WYRQQRdwFRY+JTh56vjFXD99TvznbWXal9SX70H33t5NdWCvKZ/LD5xIoFvKD5LdsoQooNMszPohcHZuAMKVIpdN3zNvhB+kJm6vsweNdi/ZzIo+rKjsh2+l4iX+jf4Ymv/aZn5sIN7WF56il4eyHuwz6ET6XR9vfswSrRiK7bctzgURNxDM9BnnWnTTbY3OVP98ebdsXfGNPTDHtUeXCo+rMqi4oWsC9xw4WhFt5MZ3Vk5HcezyEB2Xeb3WVbWOfz+fshFOm2xGvuOAYHsfsK8zVJouctW5SScyryL3PD0uWq/x0gfAGP+VtuRLwN4PA9Cubs2wTP12bW/MjwFjWlcdQW38hCRawsB+DnZ2o3TD6vyPdW0Zs+5Q/ozXUhR9cFp4l/LqDVUO2gtOaDQXFF0GMUHnabE5HVdvkwb0+QaklVFxad/Tlhe+2coEKGeGb4/eo84N7L3RY4EQRxIANBSWLLCbTND6TjgG3fyQAeDQLzQ956Qz+y/JHNu8953pWrMt3eA/I7w+haUfFvbEAzGBB6FyM1cTXk9UxvJBP9AL+G9M2U66Bu8dbNxQULQrks1VaL0Hyp2rqRafVg/nzVB3LUfyRh0CMoc7qGvjvg7s2f+4qSHB6FRx3fiH7T2jfHsTn05RlhG5UCyRhnATtcv97pLxAJnJFgrWTb6h25xdPNBNY+SG8y6/KEHXEsfGD0syqy5fc0r6kku6lH+Q7zJ1XUrR1xmUBeKlxG3/mF+qPFR8PBAruPY74MvW0W01u4ZZjvlpzHCpBaY2q9nb6DL6M8DUbXO5loTnJnVfsn+Oi5qu0fzYLR4/TKqqnzqvhHlU1GkV8zCpV86j9OP6+LkkkuRPa3bGth+JgQqoSiW37SPgCgiVdPAEAna4F3Zsok9V6o8/BY7ardDYbgbrMy+cu/3E5mK7X6oWaP5HCSvUpAiSPPcQECVjIreoS6C9YWmYtny2Wz14evHe+n1DxXNtF5ogUk25p2E7fbp4Z/3PuA8VW4fghN8+tjS8Lv9nSckIizbvpiT4FR+Ugyxzi27JXJ29D0hz24rOVhJQn+Bkp4BVukV7gLR+K1AybkVfaQGF1OV7k5+Mn/gWCZWzgiarPL1b0GWmspgATyQf3PxKXclfvtxCxOpQ7dHCqssL9m/9O1Jt3nQoGSc8klcEH4PT2ZR20AVPdIqAQfS1Ve5ylY1+dnY1DcH7bpxyw8qRrG5R1y7+Me8MqDJIXr0ebBbB3str57+58HwYIATvIsivLlvLwoeduluhiNum8q5FQIfNDfYLGfJBbHJOcawZxCD8stspypZG0GotIv8RdMC+hnZ6dCXhSmE/Ns6BeZl8KfFCTqLplv1qnERaCQdJicy6+ANqEhlX5nTt8e16AAUTAgrORzZy8d8/2d4IhbEr9M7+q+RdNbL68ZPyaZSPBICkh1C7tWEB4MBEnq/VGUNOQkXx39rUL/6cySqqAT4vJ670NDJKOkyqXHcN+qLaKfugVuu8pSBCsq5eMsrdO4+iVoASneehRNdzvBlxfhr3Gvxq/cnEBGCQVFvKdy3efx7r0L7a8Lk+UyWrZzvIr0affE0g+iKCjZ7Ndjgupj0RznSHAzZ6hKRPq2OoGBgbxCD+kNpejjATcKBFO25hb9G5fhwSSybML0iveFGZ9M3/X8YHsj0DHW3Y2K2vK+WBgEGeoChTplaZlrB1dKog21b7dsCKQ44JOtaQKSUlVDzIIlOc4y+m4NxDd0cAglqSD6TbWoC5V73XEpwMtTxLSg7zTd9BCtqAFVc2MvaVzXvlR5i1gYBAnZDnLfkt7q2B4yGcJ2GQekuCoCGPuRR6H4Lkjq8pxORgY9DNZleWnCew8I5ie3Tjt+oCnm4SsOgnZsgxCQBCUWytLZ4KBQT9xwto/HCiAHuu8DvXgOoKQBWd9wU1qItbbECzsKEUSL9gql04FA4N+IM3boqbR763thLDOPa24IoiPgLAG6yiwHELDQqT/0/bewiwwMIgynUvRZFc4LuWXX3XezhbioKtBhJcFRdm/qxzr+TUbQoCQvuTe5yetM00NDCKLsuK+VDB4BFrkbfyon8jdRKOQMJVNz6kdOyF+VL/LZOupgl5PhGceZieNToHl/Or2cMKRRPIlNhjYwMAggqhq1q+cmvGESEVVzW86IuQhwWldhEYhaWGwQqMI269ywNCU5zvP9Q8WVX5d6PDKSRWlMShQZZAMjF+zaKQwZb7LKs0vSPep6hbH9bDrVpHmfQVCIGzBWekPpcHw5lkgHG4W4h82p8MY8xiEhbWi7DxN11Zzz9I6fBDayT3ujLCkekJo9WQj4sknIR6G8Dmcf+yK8a5FAYXyGBjsi9XluJs97S9yT9MxnYVHE3nd7UuEnwzx1Ic+zIAIYat0rGMjwckQJuzJ/V7TcXpbylsDgz4ZX1n6Aw3Es9CaUy8g2OH569r84pATI0YsdoxEZJJosyQfoGtUmVVRPhEMDPpAlWrRpKgNRmiYutq8okchDCImOENTtVf4qf8WIgALT6YQtCpr1eLTwMCgG5SpmcfEc1CDlfzABJcEE+WdKvEjhEFEs9mzuqa6y0jmJm5ig/cV7oJ5z4GBQRvK1Azm9IcRxCwIFsLX3QWFZ0GYRDTMXxfyXogsaYDiySynERhq0IpSzdCUWRWS0Pjr9spiiAARFZw9O1JU+bptEFHQxM6rR2yu0oCqJhgMXLJdjqtQgBoSjIEQYEva/e6pxXUQASIqOMoDK4Einq0R/f+LR6yVjt+rXw8GSUXO+ofMahhAqnpGiCUd+aH5QpojV3M04jMype57dm9xo8jCw7lbbJXld6kLCQZJwThnWY5sbvg43LGzj/QrN06e8yVEiIgLTobZskUQRaQ77IGbZHNjSHOBDBIIArRWOa5lPV3l8hsF4YDw3MaCeW9ABImK2sPdqoN/eJQzedLzQ/Jyfr4SZ/jAYEBxwjt3H5iWmqImmp0LYUJEn0tBkzfmlUTEVdJOVJJnoAcfZM9sKb/9CqIGXrizsvrtsZuiW3fUILbYKsqnpaamqOTs4QuNin1GsSDSQqOI6kDb9m7ZkZgCz3OvOwmix/tek3bOpsk3fgMGCUvO+ivNtOe4uaSJ27mbCKiSeF8g0QM1+UXXhevs7PazIcqolKIo6cNIXYwe+BdpnjNrp9y0FQwSjpNXOQ73afQ8P45TIGLgRpGaPiFaBc6inuesdsrcrSw00c4dfALolvfGvr3wCDBIKLKcpZf5NHg/kkKj6r9qBD+JZlXAmCQIRMJ/QpThi3WUJc28bvz7S41pCQnA0W8vHMIOzacRhQq2HA4RRNfwkvUFhZ9BFImJ4EgTxmSKAAvPcM0jK7NXLwnJs2wQG2xrl0wZkmbewAOPn2GkhwtIv98wpTDqtXhiIjiaedB/2MYReNnzcCA6UOr62mx2nIFBXDH6tetTsiocd5BXVvLikRBhWLN5yp1XfCvEgJgIjtI1CcTLECMQMJNbM+d4Z/k5YBAXZK8pHZ85eNRaIeBWjI5R6kOZMWwOxIiYJUEXQO9BLEFM0wT91bq67BIw6DdUNQBbZXmR9Ak3L0YlpwRL4TYpmk6vtV22E2JEzARHA3Shml8TSwgs4MOHrKtKL+5pl6yqstPBICpMXHXnUYNIe4fV5zKM2rOGO4ng3A25v/0PxJCYRhpbXQ4nf2E+xB42S+Icd37hH9XC9BV20y6ZcRil4MXsYypyTy0OKeLWoHtULzMIzTewwNwMrWUtowaRvKu2oOS3EGOCLiwVDtzk/IH6R3DMbNu7z1bhOJEEDdsJaGUBPo7/zIT4IBhEjPEVi7NNpN1PQJMhBqiKf9APxFRwMDXj79TS+CU3E/1QjRpNLLnXYXsni+CREm9tRm+kZ63GLaqnXTnD3mtQrM1Z9gseH/6a334rkXYJj/6ge8Z8f4ri8W+WpmuD4I4h+Y3zV+I+n0OE1kqHQxBevV+2zCiC0vcp9AMxrZDG1rU93ETYIR4gFYAqV27On18PSUK9aWjOOGf50fuuz3pv4Yk2p+OB419ZlMmP4iJepQoeX8BCcDmZhD+INse58AgtQ1sLKAp3uDJu6Hy8dWXZqbaq8o+5UZobS6HhXm2zlj7sfegHYj6bctKaZYNbdO/bSBAX6Z+4q39HI88V1QULIjzlO/4Yu+L+jBRTc1ULeM+u6/R7bRXlPyWUD/Pj8C4inNf5GJL0CAjBhh1S44jRnTap1LFf8DHsL6MIxpgFTCMLzk9q84uDLzUTAfplGvJJlYuPMZOmyr5HM/AzCKiZx17Pg6bZ/bF1A5DRry1LSctsHGRC85usaDSyoWTGuKrycSYpn2Sr1DpEvBLiEDU1AIkq+EldwX87iChVk7hDZsDb7uzif0M/0W/z91WdEhIhlUOMJs2sqz/LY58/bJhW5IYBhM216FAe0r7Fb3/AfwcjysuJhLJ6jVZuAoqy9Ss0UOee7mc1+UXPQ5zRr4kv2Dx9E59A0EV9og35/8dVoMknTD7hjHbAYCzIWb04W+pa9d411KzMNRB/fMvGie9AkkUlGmz5b/2wutn22IRrBUG/Z4zJdpZfBkj38pOaCXEJeXhAXI06VUo2Jug6frq9vmHbV+fa90CCoKxhYhAuYnXsWohP/svC8q4m9MdSfekbXAXX7FBWOlul4wzkQVZNhPMFRIK4SLVkXXPvsej1PchnE0z+336CzRpE37Ggf8Zvt6ok8exEbQBN7ESps6XOtE1aaNuuPfXbts6wN0M/k0MPmfXKBjff6BMhDuHr95bHm3pB3QxVLmZ/1MzQ6gkPR21eTajEVY4y23vl08BCV/JJnRO/PVDA8JibdiLh1+x0VU66f0tJn4EwbdJ07QP31Dn/gyhjdS8ZCo16JZuJx0KcQiqqw0d5tdOL+8WsHCpxmdxP5U2TTQ1jieQoIMxAJF3XhL/V0Vj3RQ2Hk07Z3L2rqQNx+1D0BgvVDr78ddx/rSWNnEDa1qG5uzbt51gMgDEVd42wiNQT+LMOYs/cUDaxDwddHiYQZwadkLwfIMRvPLo8pS5CWTZjQWJnxbTbxfjpg/KEZnqUhetYSHC49f2GTa+1/LpBovjH9wLWf5lb2BEYO53spl2uzBNRwESpfCdSHMVWJxvfxSGQ8NC/ydtgrZ1hj1mEczgMiHSyU6peSGuRX9zBD1xEEmrHDQQ6/6Zqdkp+wM3yodybTIty0pOYQf6SSvQAgmmxFPpL/srlhMXugkIHJAADKQ8zWivLr+YWW4WMGLnW4hhWKXexmn1lTX7rFGdbxbKDAX3voKDdNXlFBZAAxDRWLcpQbV7hAwJ1K7dej3KLkDQxaIkFbieki9qFRqEMJT5o+QlboE0qJAsSgAGb+X+sc+kRKaT/mH/hhazqZA8AK13iw45N1gjOrskvWtPd5pyKJSPOKdj1jR3tUUnaH0mSomTGOOc9w1Ck2kwkjyWiDELJtgTBxif8BURpOq/Bfkh2JOe78+auhgFA0teayV7luJA0UJlR4tJBOGDQYaZ7WtGrMEAYSGOckKiZVvT8zLz68aDR1Tw26rdo2wEMu2nwqoEkNAqjulkn/HPlQfsZX5bbeDHuHYfxj0p27rvTnT/vdhhgGILTDWruyuBMzyXcVN4BEU7PmiwoPw07Z1loigec0CgMwemF094sTf82XczhizSPF4eCQeBIuNM9teg2GKAYghMAOeuXHkEtshAkXRXLOfWJDOpibM20uR/BAMUQnCDIriofTQT38NsLjOrXvWM2pxy0btJ138EAJemtasFQk1u4xZ1XOIuk/nPW4CNWwXgg4vU2psAAxhCcEKgtKHm2xZcyRoX2+FcgvIkIj0HyoqZ8bOALofKvfcp98fcamQe0SmuoG2Ey6nN76tZRt7dYXWW3IQo7BI+qT9ns/0OgtjWp3KOlsDVXgziHAJfIxoNu3Xj6LxshiTAEJ0LYnKULAcV89V4FmLIEbOd3/waSn0kQn7ME/IdI1pOAXSYdt2MabE9vTN2xYvo1jdhdcVeyi3GuHwwZJBsOatLgEJahIZqAETzGGs8bcxDwpGjH36meg8/sQwJyoqQPQGjTeO1vOraz7cxD3qPqkiAn3b4YghMhbBXLxoLeNGiP+aDNm/OviElkdk5V+Tjpk8eDCS/ip3wcC9U/gPT1LIg7VJILQG1IW67un/DfYX19Hnd49RLwDdDpFTSlutx51+0XSZFdWX4XtSZTV2x15xcdBUmIITjJAWa7yvO557iR35/fzXYP9y6lHk/9wroZ9obePqg1f7T4Kz85Z/DiFhachJ95GwqG4CQTbEIfV+Eo0BBvQQGndaxGkNzbHO3OCywz5tiq8gNSpFTl1Y9lwRkFSUhMqxUY9DM8lvoAoILfVVhXLfqZ0MzXcy80nMdLJo20gK1gdbmF37MQnmarXJy0dVb/H8i1Pya5ep8fAAAAAElFTkSuQmCC" alt="Chatify logo" />
          <h1>Chatify</h1>
        </div>
      </header>
      <main>
        <h1>Welcome to Chatify Messenger!</h1>
        <p>Thank you for choosing Chatify. To activate your account, please use the following OTP code:</p>
        <h2>Your OTP Code: <span class="highlight">${OTPCode}</span></h2>
        <p>Enter this code during the account activation process. If you did not sign up for Chatify, you can safely ignore this email.</p>
        <p>Best Regards,<br>Chatify Team</p>
      </main>
      <footer>
        &copy; ${new Date().getFullYear()} Chatify. All rights reserved.
      </footer>
    </div>
  </body>
</html>
`;
};
